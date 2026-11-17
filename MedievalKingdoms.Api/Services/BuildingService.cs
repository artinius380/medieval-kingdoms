using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Models.Dtos;
using MedievalKingdoms.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Services;

// ============================================================
// EDIFICIOS
// Reemplaza a backend/src/services/buildingService.js
// ============================================================

public class BuildingService
{
    private readonly MedievalKingdomsContext _db;
    private readonly ResourceService _resources;

    public BuildingService(MedievalKingdomsContext db, ResourceService resources)
    {
        _db = db;
        _resources = resources;
    }

    // ========================================================
    // Todas las edificaciones del juego con su estado en la ciudad
    // (las no construidas salen con nivel 0)
    // ========================================================
    public async Task<List<BuildingResponse>> GetCityBuildingsAsync(long cityId)
    {
        var buildings = await LoadCatalogAsync();
        var levels = await LoadCityLevelsAsync(cityId);

        return buildings
            .Select(b => ToResponse(cityId, b, levels))
            .ToList();
    }

    // ========================================================
    // Una edificación construida en la ciudad (null si no existe)
    // ========================================================
    public async Task<BuildingResponse?> GetCityBuildingAsync(long cityId, long buildingId)
    {
        var levels = await LoadCityLevelsAsync(cityId);

        if (!levels.ContainsKey(buildingId))
        {
            return null;
        }

        var building = (await LoadCatalogAsync(buildingId)).FirstOrDefault();

        return building is null ? null : ToResponse(cityId, building, levels);
    }

    // ========================================================
    // MEJORAR EDIFICACIÓN
    // ========================================================
    public async Task<BuildingResponse> UpgradeCityBuildingAsync(long cityId, long buildingId)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        // Bloquear la ciudad: dos mejoras a la vez no pueden
        // gastar los mismos recursos.
        await _resources.LockCityAsync(cityId);

        // ---------------- La edificación existe ----------------
        var building = (await LoadCatalogAsync(buildingId)).FirstOrDefault()
            ?? throw GameException.NotFound("La edificación no existe.");

        var levels = await LoadCityLevelsAsync(cityId);
        var currentLevel = levels.GetValueOrDefault(buildingId);

        // ---------------- Requisitos ----------------
        foreach (var requirement in building.Requirements)
        {
            var requiredCurrent = levels.GetValueOrDefault(requirement.RequiredBuildingId);

            if (requiredCurrent < requirement.RequiredLevel)
            {
                throw new GameException(
                    $"Requiere {requirement.RequiredBuilding!.Name} nivel {requirement.RequiredLevel}");
            }
        }

        // ---------------- Costos del siguiente nivel ----------------
        if (building.Costs.Count == 0)
        {
            throw new GameException("La edificación no tiene costos definidos.");
        }

        var costs = building.Costs
            .Select(c => new
            {
                c.ResourceId,
                ResourceName = c.Resource!.Name,
                Amount = Math.Round(
                    (decimal)GameRules.UpgradeCost((double)c.Amount, currentLevel), 4)
            })
            .ToList();

        // ---------------- Sumar la producción pendiente ----------------
        // Así el jugador puede usar lo que produjo hasta este momento.
        await _resources.UpdateCityResourcesAsync(cityId);

        var cityResources = await _db.CityResources
            .Where(cr => cr.CityId == cityId)
            .ToDictionaryAsync(cr => cr.ResourceId);

        // ---------------- Verificar recursos ----------------
        foreach (var cost in costs)
        {
            var available = cityResources.TryGetValue(cost.ResourceId, out var row)
                ? row.Amount
                : 0m;

            if (available < cost.Amount)
            {
                throw new GameException($"Recursos insuficientes: {cost.ResourceName}");
            }
        }

        // ---------------- Descontar recursos ----------------
        foreach (var cost in costs)
        {
            cityResources[cost.ResourceId].Amount -= cost.Amount;
        }

        // ---------------- Construir o subir de nivel ----------------
        var cityBuilding = await _db.CityBuildings
            .FirstOrDefaultAsync(cb => cb.CityId == cityId && cb.BuildingId == buildingId);

        if (cityBuilding is null)
        {
            // Primera construcción: nivel 0 -> 1
            _db.CityBuildings.Add(new CityBuilding
            {
                CityId = cityId,
                BuildingId = buildingId,
                Level = 1
            });
        }
        else
        {
            cityBuilding.Level += 1;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (await GetCityBuildingAsync(cityId, buildingId))!;
    }

    // ========================================================
    // Ayudantes
    // ========================================================

    // Catálogo de edificios con producción, costos y requisitos
    private async Task<List<Building>> LoadCatalogAsync(long? buildingId = null)
    {
        var query = _db.Buildings
            .AsNoTracking()
            .Include(b => b.Production).ThenInclude(p => p.Resource)
            .Include(b => b.Costs).ThenInclude(c => c.Resource)
            .Include(b => b.Requirements).ThenInclude(r => r.RequiredBuilding)
            .AsSplitQuery()
            .AsQueryable();

        if (buildingId is not null)
        {
            query = query.Where(b => b.Id == buildingId.Value);
        }

        return await query.OrderBy(b => b.Id).ToListAsync();
    }

    // Nivel de cada edificio construido en la ciudad: { building_id: level }
    private Task<Dictionary<long, int>> LoadCityLevelsAsync(long cityId) =>
        _db.CityBuildings
            .AsNoTracking()
            .Where(cb => cb.CityId == cityId)
            .ToDictionaryAsync(cb => cb.BuildingId, cb => cb.Level);

    // Arma la respuesta con el mismo formato que Node
    private static BuildingResponse ToResponse(
        long cityId,
        Building building,
        Dictionary<long, int> levels)
    {
        var level = levels.GetValueOrDefault(building.Id);
        var production = building.Production.FirstOrDefault();

        var baseCost = (double)building.BaseCost;
        var multiplier = (double)(production?.ProductionMultiplier ?? 0);

        var upgradeCosts = building.Costs
            .OrderBy(c => c.ResourceId)
            .Select(c => new BuildingCostResponse(
                c.ResourceId,
                c.Resource!.Name,
                (double)c.Resource.Value,
                GameRules.UpgradeCost((double)c.Amount, level)))
            .ToList();

        var requirements = building.Requirements
            .OrderBy(r => r.RequiredBuildingId)
            .Select(r =>
            {
                var current = levels.GetValueOrDefault(r.RequiredBuildingId);

                return new BuildingRequirementResponse(
                    r.RequiredBuildingId,
                    r.RequiredBuilding!.Name,
                    r.RequiredLevel,
                    current,
                    current >= r.RequiredLevel);
            })
            .ToList();

        return new BuildingResponse(
            CityId: cityId,
            BuildingId: building.Id,
            Name: building.Name,
            Category: building.Category,
            ResourceId: production?.ResourceId,
            ResourceName: production?.Resource?.Name,
            ResourceValue: (double)(production?.Resource?.Value ?? 0),
            Level: level,
            BaseCost: baseCost,
            ProductionMultiplier: multiplier,
            ProductionPerHour: GameRules.ProductionPerHour(baseCost, level, multiplier),
            NextLevel: level + 1,
            BuildingValue: GameRules.BuildingValue(baseCost, level),
            UpgradeValue: GameRules.UpgradeValue(baseCost, level),
            UpgradeCosts: upgradeCosts,
            Requirements: requirements);
    }
}
