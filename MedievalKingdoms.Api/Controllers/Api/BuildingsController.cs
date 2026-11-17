using MedievalKingdoms.Api.Models.Dtos;
using MedievalKingdoms.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedievalKingdoms.Api.Controllers.Api;

// ============================================================
// EDIFICIOS DE UNA CIUDAD
// Reemplaza a backend/src/routes/buildingRoutes.js
// ============================================================

[ApiController]
[Route("api/players/{playerId:long}/cities/{cityId:long}/buildings")]
public class BuildingsController : ControllerBase
{
    private readonly CityService _cities;
    private readonly BuildingService _buildings;

    public BuildingsController(CityService cities, BuildingService buildings)
    {
        _cities = cities;
        _buildings = buildings;
    }

    // GET /api/players/{playerId}/cities/{cityId}/buildings
    [HttpGet]
    public async Task<ActionResult<CityBuildingsResponse>> GetBuildings(long playerId, long cityId)
    {
        await _cities.EnsureCityBelongsToPlayerAsync(playerId, cityId);

        return new CityBuildingsResponse(cityId, await _buildings.GetCityBuildingsAsync(cityId));
    }

    // GET /api/players/{playerId}/cities/{cityId}/buildings/{buildingId}
    [HttpGet("{buildingId:long}")]
    public async Task<ActionResult<BuildingResponse>> GetBuilding(
        long playerId, long cityId, long buildingId)
    {
        await _cities.EnsureCityBelongsToPlayerAsync(playerId, cityId);

        return await _buildings.GetCityBuildingAsync(cityId, buildingId)
            ?? throw GameException.NotFound("Edificio no encontrado");
    }

    // POST /api/players/{playerId}/cities/{cityId}/buildings/{buildingId}/upgrade
    [HttpPost("{buildingId:long}/upgrade")]
    public async Task<ActionResult<UpgradeResponse>> Upgrade(
        long playerId, long cityId, long buildingId)
    {
        await _cities.EnsureCityBelongsToPlayerAsync(playerId, cityId);

        var building = await _buildings.UpgradeCityBuildingAsync(cityId, buildingId);

        return new UpgradeResponse("Edificación mejorada correctamente.", building);
    }
}
