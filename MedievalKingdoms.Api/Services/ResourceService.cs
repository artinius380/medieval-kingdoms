using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Services;

// ============================================================
// RECURSOS
// Reemplaza a backend/src/services/resourceService.js
// ============================================================
// Cada vez que se consultan los recursos de una ciudad se suma
// lo producido desde la última actualización (updated_at) y se
// guarda el nuevo total.
// ============================================================

public class ResourceService
{
    private readonly MedievalKingdomsContext _db;

    public ResourceService(MedievalKingdomsContext db)
    {
        _db = db;
    }

    // Bloquea la fila de la ciudad hasta que termine la transacción.
    // Evita que dos peticiones a la vez cuenten la misma producción
    // o gasten los mismos recursos (equivale al FOR UPDATE de MySQL).
    public Task LockCityAsync(long cityId) =>
        _db.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT id FROM cities WITH (UPDLOCK, HOLDLOCK) WHERE id = {cityId}");

    public async Task<List<ResourceResponse>> UpdateCityResourcesAsync(long cityId)
    {
        // Si ya hay una transacción abierta (por ejemplo, al mejorar un
        // edificio) se usa esa; si no, se abre una propia.
        var ownTransaction = _db.Database.CurrentTransaction is null;

        await using var transaction = ownTransaction
            ? await _db.Database.BeginTransactionAsync()
            : null;

        await LockCityAsync(cityId);

        // ---------------- Recursos actuales ----------------
        var cityResources = await _db.CityResources
            .Include(cr => cr.Resource)
            .Where(cr => cr.CityId == cityId)
            .OrderBy(cr => cr.ResourceId)
            .ToListAsync();

        if (cityResources.Count == 0)
        {
            throw GameException.NotFound("Recursos de la ciudad no encontrados");
        }

        // ---------------- Producción por hora de cada recurso ----------------
        // Solo los edificios con fila en building_production producen.
        var producers = await (
            from cb in _db.CityBuildings
            join bp in _db.BuildingProductions on cb.BuildingId equals bp.BuildingId
            where cb.CityId == cityId
            select new
            {
                bp.ResourceId,
                cb.Level,
                BaseCost = cb.Building!.BaseCost,
                bp.ProductionMultiplier
            })
            .ToListAsync();

        var productionByResource = producers
            .GroupBy(p => p.ResourceId)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(p => GameRules.ProductionPerHour(
                    (double)p.BaseCost, p.Level, (double)p.ProductionMultiplier)));

        // ---------------- Sumar lo producido ----------------
        var now = DateTime.Now;

        foreach (var resource in cityResources)
        {
            // Nunca negativo: si la hora guardada quedara en el futuro,
            // simplemente no se produce nada en vez de restar.
            var elapsedHours = Math.Max(0, (now - resource.UpdatedAt).TotalHours);

            var perHour = productionByResource.GetValueOrDefault(resource.ResourceId);

            var newAmount = (double)resource.Amount + perHour * elapsedHours;

            resource.Amount = Math.Round((decimal)newAmount, 4);
            resource.UpdatedAt = now;
        }

        await _db.SaveChangesAsync();

        if (transaction is not null)
        {
            await transaction.CommitAsync();
        }

        return cityResources
            .Select(cr => new ResourceResponse(
                cr.ResourceId,
                cr.Resource!.Name,
                (double)cr.Resource.Value,
                (double)cr.Amount,
                cr.UpdatedAt))
            .ToList();
    }
}
