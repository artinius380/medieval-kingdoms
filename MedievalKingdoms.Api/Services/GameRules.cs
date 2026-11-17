namespace MedievalKingdoms.Api.Services;

// ============================================================
// REGLAS DEL JUEGO (fórmulas)
// ============================================================
// Todas las fórmulas de costo y producción en un solo lugar.
// Si Paradox quiere balancear el juego, solo toca este archivo.
// ============================================================

public static class GameRules
{
    // Cada nivel cuesta 1.5 veces el anterior
    public const double CostMultiplier = 1.5;

    // Valor del edificio en su nivel actual.
    // Nivel 1 = base, nivel 2 = base × 1.5, nivel 3 = base × 1.5² ...
    public static double BuildingValue(double baseCost, int level) =>
        level <= 0 ? baseCost : baseCost * Math.Pow(CostMultiplier, level - 1);

    // Valor del siguiente nivel (lo que cuesta mejorar)
    public static double UpgradeValue(double baseCost, int level) =>
        baseCost * Math.Pow(CostMultiplier, Math.Max(level, 0));

    // Producción por hora de un edificio productor
    public static double ProductionPerHour(double baseCost, int level, double productionMultiplier) =>
        level <= 0 ? 0 : BuildingValue(baseCost, level) * productionMultiplier;

    // Costo de un recurso para pasar del nivel actual al siguiente.
    // Nivel 0 -> 1 = costo base
    // Nivel 1 -> 2 = costo base × 1.5
    // Nivel 2 -> 3 = costo base × 1.5² ...
    public static double UpgradeCost(double baseAmount, int currentLevel) =>
        baseAmount * Math.Pow(CostMultiplier, Math.Max(currentLevel, 0));
}
