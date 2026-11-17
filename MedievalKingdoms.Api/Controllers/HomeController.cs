using System.Diagnostics;
using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Models;
using MedievalKingdoms.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Controllers;

// ============================================================
// PANEL MVC (Modelo - Vista - Controlador)
// ============================================================
// El juego lo dibuja React usando la API (/api/...).
// Este controlador muestra con vistas Razor un panel con el
// estado de la base: ciudades, recursos y edificios.
// ============================================================

public class HomeController : Controller
{
    private readonly MedievalKingdomsContext _db;
    private readonly ResourceService _resources;
    private readonly BuildingService _buildings;

    public HomeController(
        MedievalKingdomsContext db,
        ResourceService resources,
        BuildingService buildings)
    {
        _db = db;
        _resources = resources;
        _buildings = buildings;
    }

    // GET /
    public async Task<IActionResult> Index()
    {
        var model = new PanelViewModel
        {
            Connected = await _db.Database.CanConnectAsync()
        };

        if (!model.Connected)
        {
            return View(model);
        }

        var cities = await _db.Cities
            .AsNoTracking()
            .Include(c => c.Player)
            .OrderBy(c => c.Id)
            .ToListAsync();

        foreach (var city in cities)
        {
            var panelCity = new PanelCity
            {
                Id = city.Id,
                Name = city.Name,
                PlayerName = city.Player?.Username ?? "-",
                X = city.CoordinateX,
                Y = city.CoordinateY,
                Buildings = (await _buildings.GetCityBuildingsAsync(city.Id))
                    .Where(b => b.Level > 0)
                    .ToList()
            };

            try
            {
                panelCity.Resources = await _resources.UpdateCityResourcesAsync(city.Id);
            }
            catch (GameException)
            {
                // Ciudad sin filas de recursos: se muestra vacía
            }

            model.Cities.Add(panelCity);
        }

        return View(model);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
