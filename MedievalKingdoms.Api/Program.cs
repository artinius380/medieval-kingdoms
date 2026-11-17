using System.Text.Json;
using MedievalKingdoms.Api.Data;
using MedievalKingdoms.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// Base de datos: SQL Server (cadena en appsettings.json)
// ------------------------------------------------------------
builder.Services.AddDbContext<MedievalKingdomsContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("MedievalKingdoms")));

// ------------------------------------------------------------
// MVC + API
// El JSON sale en snake_case (player_id, city_id...), igual que
// el backend de Node, para que React no tenga que cambiar.
// ------------------------------------------------------------
builder.Services.AddControllersWithViews(options =>
    {
        // Convierte GameException en JSON { error, message } con su código HTTP
        options.Filters.Add<GameExceptionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            JsonNamingPolicy.SnakeCaseLower;
    });

// ------------------------------------------------------------
// Servicios del juego (la lógica que antes estaba en backend/src/services)
// ------------------------------------------------------------
builder.Services.AddScoped<CityService>();
builder.Services.AddScoped<ResourceService>();
builder.Services.AddScoped<BuildingService>();

// ------------------------------------------------------------
// CORS: permite que el frontend de Vite (puerto 5173) llame a la API
// ------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseCors("Frontend");

app.UseAuthorization();

app.MapStaticAssets();

// Rutas de la API (/api/...)
app.MapControllers();

// Rutas MVC con vistas (Home/Index, etc.)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
