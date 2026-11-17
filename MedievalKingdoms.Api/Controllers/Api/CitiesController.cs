using MedievalKingdoms.Api.Models.Dtos;
using MedievalKingdoms.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedievalKingdoms.Api.Controllers.Api;

// ============================================================
// CIUDADES Y RECURSOS
// Reemplaza a backend/src/routes/cityRoutes.js
// ============================================================

[ApiController]
[Route("api/players/{playerId:long}/cities")]
public class CitiesController : ControllerBase
{
    private readonly CityService _cities;
    private readonly ResourceService _resources;

    public CitiesController(CityService cities, ResourceService resources)
    {
        _cities = cities;
        _resources = resources;
    }

    // GET /api/players/{playerId}/cities
    [HttpGet]
    public async Task<ActionResult<CitiesResponse>> GetCities(long playerId)
    {
        await _cities.EnsurePlayerExistsAsync(playerId);

        return new CitiesResponse(await _cities.GetPlayerCitiesAsync(playerId));
    }

    // GET /api/players/{playerId}/cities/{cityId}
    [HttpGet("{cityId:long}")]
    public async Task<ActionResult<CityResponse>> GetCity(long playerId, long cityId)
    {
        await _cities.EnsurePlayerExistsAsync(playerId);

        return await _cities.GetPlayerCityAsync(playerId, cityId)
            ?? throw GameException.NotFound("Ciudad no encontrada");
    }

    // GET /api/players/{playerId}/cities/{cityId}/resources
    // Suma la producción pendiente y devuelve los recursos actualizados
    [HttpGet("{cityId:long}/resources")]
    public async Task<ActionResult<CityResourcesResponse>> GetResources(long playerId, long cityId)
    {
        await _cities.EnsurePlayerExistsAsync(playerId);

        _ = await _cities.GetPlayerCityAsync(playerId, cityId)
            ?? throw GameException.NotFound("Ciudad no encontrada");

        var resources = await _resources.UpdateCityResourcesAsync(cityId);

        return new CityResourcesResponse(cityId, resources);
    }

    // POST /api/players/{playerId}/cities
    // Body: { "name": "Nueva ciudad", "x": 3, "y": 5 }
    [HttpPost]
    public async Task<ActionResult<CityResponse>> CreateCity(
        long playerId,
        [FromBody] CreateCityRequest request)
    {
        await _cities.EnsurePlayerExistsAsync(playerId);

        var city = await _cities.CreateCityAsync(playerId, request);

        return StatusCode(StatusCodes.Status201Created, city);
    }
}
