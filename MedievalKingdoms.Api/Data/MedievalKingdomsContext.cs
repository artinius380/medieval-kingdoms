using System.Text.RegularExpressions;
using MedievalKingdoms.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Data;

// ============================================================
// CONTEXTO DE BASE DE DATOS (Entity Framework Core)
// ============================================================
// Conecta las clases de Models/Entities con las tablas de
// SQL Server. En C# las propiedades van en PascalCase
// (CoordinateX) y en la base en snake_case (coordinate_x);
// al final de OnModelCreating se convierten automáticamente.
// ============================================================

public class MedievalKingdomsContext : DbContext
{
    public MedievalKingdomsContext(DbContextOptions<MedievalKingdomsContext> options)
        : base(options)
    {
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<CityResource> CityResources => Set<CityResource>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<BuildingProduction> BuildingProductions => Set<BuildingProduction>();
    public DbSet<BuildingCost> BuildingCosts => Set<BuildingCost>();
    public DbSet<BuildingRequirement> BuildingRequirements => Set<BuildingRequirement>();
    public DbSet<CityBuilding> CityBuildings => Set<CityBuilding>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------------- players ----------------
        modelBuilder.Entity<Player>(e =>
        {
            e.ToTable("players");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Username).IsUnique();
        });

        // ---------------- cities ----------------
        modelBuilder.Entity<City>(e =>
        {
            e.ToTable("cities");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Player)
                .WithMany(p => p.Cities)
                .HasForeignKey(x => x.PlayerId);
        });

        // ---------------- resources ----------------
        modelBuilder.Entity<Resource>(e =>
        {
            e.ToTable("resources");
            e.HasKey(x => x.Id);
            e.Property(x => x.Value).HasPrecision(10, 2);
        });

        // ---------------- city_resources ----------------
        modelBuilder.Entity<CityResource>(e =>
        {
            e.ToTable("city_resources");
            e.HasKey(x => new { x.CityId, x.ResourceId });
            e.Property(x => x.Amount).HasPrecision(20, 4);
            e.HasOne(x => x.City)
                .WithMany(c => c.Resources)
                .HasForeignKey(x => x.CityId);
            e.HasOne(x => x.Resource)
                .WithMany()
                .HasForeignKey(x => x.ResourceId);
        });

        // ---------------- buildings ----------------
        modelBuilder.Entity<Building>(e =>
        {
            e.ToTable("buildings");
            e.HasKey(x => x.Id);
            e.Property(x => x.BaseCost).HasPrecision(20, 4);
        });

        // ---------------- building_production ----------------
        modelBuilder.Entity<BuildingProduction>(e =>
        {
            e.ToTable("building_production");
            e.HasKey(x => new { x.BuildingId, x.ResourceId });
            e.Property(x => x.ProductionMultiplier).HasPrecision(10, 4);
            e.HasOne(x => x.Building)
                .WithMany(b => b.Production)
                .HasForeignKey(x => x.BuildingId);
            e.HasOne(x => x.Resource)
                .WithMany()
                .HasForeignKey(x => x.ResourceId);
        });

        // ---------------- building_costs ----------------
        modelBuilder.Entity<BuildingCost>(e =>
        {
            e.ToTable("building_costs");
            e.HasKey(x => new { x.BuildingId, x.ResourceId });
            e.Property(x => x.Amount).HasPrecision(20, 4);
            e.HasOne(x => x.Building)
                .WithMany(b => b.Costs)
                .HasForeignKey(x => x.BuildingId);
            e.HasOne(x => x.Resource)
                .WithMany()
                .HasForeignKey(x => x.ResourceId);
        });

        // ---------------- building_requirements ----------------
        modelBuilder.Entity<BuildingRequirement>(e =>
        {
            e.ToTable("building_requirements");
            e.HasKey(x => new { x.BuildingId, x.RequiredBuildingId });
            e.HasOne(x => x.Building)
                .WithMany(b => b.Requirements)
                .HasForeignKey(x => x.BuildingId);
            e.HasOne(x => x.RequiredBuilding)
                .WithMany()
                .HasForeignKey(x => x.RequiredBuildingId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // ---------------- city_buildings ----------------
        modelBuilder.Entity<CityBuilding>(e =>
        {
            e.ToTable("city_buildings");
            e.HasKey(x => new { x.CityId, x.BuildingId });
            e.HasOne(x => x.City)
                .WithMany(c => c.Buildings)
                .HasForeignKey(x => x.CityId);
            e.HasOne(x => x.Building)
                .WithMany()
                .HasForeignKey(x => x.BuildingId);
        });

        // ------------------------------------------------------
        // Nombres de columna: PascalCase -> snake_case
        // CoordinateX -> coordinate_x, CreatedAt -> created_at
        // ------------------------------------------------------
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }
        }
    }

    private static string ToSnakeCase(string name) =>
        Regex.Replace(name, "(?<!^)([A-Z])", "_$1").ToLowerInvariant();
}
