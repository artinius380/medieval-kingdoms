using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Models.Dtos;
using MedievalKingdoms.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedievalKingdoms.Api.Controllers.Api;

// ============================================================
// JUGADORES
// Reemplaza a backend/src/routes/playerRoutes.js
// ============================================================

[ApiController]
[Route("api/players")]
public class PlayersController : ControllerBase
{
    private readonly MedievalKingdomsContext _db;

    public PlayersController(MedievalKingdomsContext db)
    {
        _db = db;
    }

    // GET /api/players/{playerId}
    // Respuesta: { "player_id": 1, "username": "Arty" }
    [HttpGet("{playerId:long}")]
    public async Task<ActionResult<PlayerResponse>> GetPlayer(long playerId)
    {
        var player = await _db.Players
            .AsNoTracking()
            .Where(p => p.Id == playerId)
            .Select(p => new PlayerResponse(p.Id, p.Username))
            .FirstOrDefaultAsync();

        return player ?? throw GameException.NotFound("Jugador no encontrado");
    }

    // GET /api/test-db  (equivalente al /test-db de Node)
    [HttpGet("/api/test-db")]
    public async Task<IActionResult> TestDb()
    {
        var canConnect = await _db.Database.CanConnectAsync();
        var players = canConnect ? await _db.Players.CountAsync() : 0;

        return Ok(new { conectado = canConnect, jugadores = players });
    }
}
