using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MedievalKingdoms.Api.Services;

// ============================================================
// ERRORES DEL JUEGO
// ============================================================
// Se lanza desde los servicios cuando algo no se puede hacer
// ("Recursos insuficientes", "Ciudad no encontrada"...).
// El filtro de abajo lo convierte en una respuesta JSON con el
// código HTTP correcto, igual que el errorHandler de Node.
// ============================================================

public class GameException : Exception
{
    public int StatusCode { get; }

    public GameException(string message, int statusCode = StatusCodes.Status400BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public static GameException NotFound(string message) =>
        new(message, StatusCodes.Status404NotFound);
}

public class GameExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GameExceptionFilter> _logger;

    public GameExceptionFilter(ILogger<GameExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        if (context.Exception is GameException gameError)
        {
            // "error" lo lee api.ts y "message" lo lee useBuildings.ts
            context.Result = new ObjectResult(new
            {
                error = gameError.Message,
                message = gameError.Message
            })
            {
                StatusCode = gameError.StatusCode
            };
        }
        else
        {
            _logger.LogError(context.Exception, "Error no controlado");

            context.Result = new ObjectResult(new
            {
                error = "Error interno del servidor",
                message = "Error interno del servidor"
            })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }

        context.ExceptionHandled = true;
    }
}
