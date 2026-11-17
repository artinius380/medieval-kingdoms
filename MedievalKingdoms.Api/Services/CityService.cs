using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Models.Dtos;
using MedievalKingdoms.Api.Models.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Services;

// ============================================================
// CIUDADES
// Reemplaza a backend/src/services/cityService.js
// ============================================================

public class CityService
{
    private readonly MedievalKingdomsContext _db;

    public CityService(MedievalKingdomsContext db)
    {
        _db = db;
    }

    // Lanza 404 si el jugador no existe (equivale a validatePlayer de Node)
    public async Task EnsurePlayerExistsAsync(long playerId)
    {
        if (playerId <= 0)
        {
            throw new GameException("ID de jugador inválido");
        }

        var exists = await _db.Players.AnyAsync(p => p.Id == playerId);

        if (!exists)
        {
            throw GameException.NotFound("Jugador no encontrado");
        }
    }

    // Lanza 404 si la ciudad no es del jugador (equivale a validateCityOwnership)
    public async Task EnsureCityBelongsToPlayerAsync(long playerId, long cityId)
    {
        await EnsurePlayerExistsAsync(playerId);

        if (cityId <= 0)
        {
            throw new GameException("ID de ciudad inválido");
        }

        var belongs = await _db.Cities
            .AnyAsync(c => c.Id == cityId && c.PlayerId == playerId);

        if (!belongs)
        {
            throw GameException.NotFound("La ciudad no pertenece al jugador");
        }
    }

    public async Task<List<CityResponse>> GetPlayerCitiesAsync(long playerId)
    {
        return await _db.Cities
            .AsNoTracking()
            .Where(c => c.PlayerId == playerId)
            .OrderBy(c => c.Id)
            .Select(c => new CityResponse(
                c.Id, c.PlayerId, c.Name, c.CoordinateX, c.CoordinateY, c.CreatedAt))
            .ToListAsync();
    }

    public async Task<CityResponse?> GetPlayerCityAsync(long playerId, long cityId)
    {
        return await _db.Cities
            .AsNoTracking()
            .Where(c => c.Id == cityId && c.PlayerId == playerId)
            .Select(c => new CityResponse(
                c.Id, c.PlayerId, c.Name, c.CoordinateX, c.CoordinateY, c.CreatedAt))
            .FirstOrDefaultAsync();
    }

    public async Task<CityResponse> CreateCityAsync(long playerId, CreateCityRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new GameException("El nombre de la ciudad es obligatorio");
        }

        if (request.X is null || request.Y is null)
        {
            throw new GameException("Las coordenadas x e y son obligatorias");
        }

        var city = new City
        {
            PlayerId = playerId,
            Name = request.Name.Trim(),
            CoordinateX = request.X.Value,
            CoordinateY = request.Y.Value,
            CreatedAt = DateTime.Now
        };

        _db.Cities.Add(city);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2627 or 2601 })
        {
            // Violación del UNIQUE (coordinate_x, coordinate_y)
            throw new GameException(
                "Ya existe una ciudad en esas coordenadas",
                StatusCodes.Status409Conflict);
        }

        // La ciudad nueva arranca con una fila por recurso (en 0).
        // En Node no se creaban y la ciudad quedaba sin recursos.
        var resourceIds = await _db.Resources.Select(r => r.Id).ToListAsync();

        foreach (var resourceId in resourceIds)
        {
            _db.CityResources.Add(new CityResource
            {
                CityId = city.Id,
                ResourceId = resourceId,
                Amount = 0,
                UpdatedAt = DateTime.Now
            });
        }

        await _db.SaveChangesAsync();

        return new CityResponse(
            city.Id, city.PlayerId, city.Name, city.CoordinateX, city.CoordinateY, city.CreatedAt);
    }
}
