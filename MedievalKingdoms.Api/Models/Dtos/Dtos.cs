namespace MedievalKingdoms.Api.Models.Dtos;

// ============================================================
// RESPUESTAS DE LA API (DTOs)
// ============================================================
// Las propiedades se escriben en PascalCase y salen en el JSON
// en snake_case (PlayerId -> player_id), igual que en Node.
// ============================================================

// ---------------- Jugadores ----------------

public record PlayerResponse(long PlayerId, string Username);

// ---------------- Ciudades ----------------

public record CityResponse(
    long Id,
    long PlayerId,
    string Name,
    int X,
    int Y,
    DateTime CreatedAt);

public record CitiesResponse(List<CityResponse> Cities);

public record CreateCityRequest(string? Name, int? X, int? Y);

// ---------------- Recursos ----------------

public record ResourceResponse(
    long ResourceId,
    string Name,
    double Value,
    double Amount,
    DateTime UpdatedAt);

public record CityResourcesResponse(long CityId, List<ResourceResponse> Resources);

// ---------------- Edificios ----------------

public record BuildingCostResponse(
    long ResourceId,
    string ResourceName,
    double ResourceValue,
    double Amount);

public record BuildingRequirementResponse(
    long BuildingId,
    string BuildingName,
    int RequiredLevel,
    int CurrentLevel,
    bool Met);

public record BuildingResponse(
    long CityId,
    long BuildingId,
    string Name,
    string Category,
    long? ResourceId,
    string? ResourceName,
    double ResourceValue,
    int Level,
    double BaseCost,
    double ProductionMultiplier,
    double ProductionPerHour,
    int NextLevel,
    double BuildingValue,
    double UpgradeValue,
    List<BuildingCostResponse> UpgradeCosts,
    List<BuildingRequirementResponse> Requirements);

public record CityBuildingsResponse(long CityId, List<BuildingResponse> Buildings);

public record UpgradeResponse(string Message, BuildingResponse Building);
