// ============================================================
// ENTIDADES (una clase por tabla de SQL Server)
// ============================================================
// Cada clase representa una tabla de la base medieval_kingdoms.
// El nombre real de tablas y columnas (snake_case) se configura
// en Data/MedievalKingdomsContext.cs.
// ============================================================

namespace MedievalKingdoms.Api.Models.Entities;

// Tabla: players
public class Player
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public List<City> Cities { get; set; } = new();
}

// Tabla: cities
public class City
{
    public long Id { get; set; }
    public long PlayerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CoordinateX { get; set; }
    public int CoordinateY { get; set; }
    public DateTime CreatedAt { get; set; }

    public Player? Player { get; set; }
    public List<CityResource> Resources { get; set; } = new();
    public List<CityBuilding> Buildings { get; set; } = new();
}

// Tabla: resources (Minerales, Madera, Comida)
public class Resource
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

// Tabla: city_resources (cuánto tiene cada ciudad de cada recurso)
public class CityResource
{
    public long CityId { get; set; }
    public long ResourceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime UpdatedAt { get; set; }

    public City? City { get; set; }
    public Resource? Resource { get; set; }
}

// Tabla: buildings (catálogo de edificaciones)
public class Building
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // RECURSOS | EJERCITO | TECNOLOGIAS
    public decimal BaseCost { get; set; }

    public List<BuildingProduction> Production { get; set; } = new();
    public List<BuildingCost> Costs { get; set; } = new();
    public List<BuildingRequirement> Requirements { get; set; } = new();
}

// Tabla: building_production (qué recurso produce cada edificio)
public class BuildingProduction
{
    public long BuildingId { get; set; }
    public long ResourceId { get; set; }
    public decimal ProductionMultiplier { get; set; }

    public Building? Building { get; set; }
    public Resource? Resource { get; set; }
}

// Tabla: building_costs (costo base por recurso, nivel 1)
public class BuildingCost
{
    public long BuildingId { get; set; }
    public long ResourceId { get; set; }
    public decimal Amount { get; set; }

    public Building? Building { get; set; }
    public Resource? Resource { get; set; }
}

// Tabla: building_requirements (ej. Caballeria requiere Armeria nivel 5)
public class BuildingRequirement
{
    public long BuildingId { get; set; }
    public long RequiredBuildingId { get; set; }
    public int RequiredLevel { get; set; }

    public Building? Building { get; set; }
    public Building? RequiredBuilding { get; set; }
}

// Tabla: city_buildings (edificios construidos en cada ciudad y su nivel)
public class CityBuilding
{
    public long CityId { get; set; }
    public long BuildingId { get; set; }
    public int Level { get; set; }

    public City? City { get; set; }
    public Building? Building { get; set; }
}
