using MedievalKingdoms.Api.Models.Dtos;

namespace MedievalKingdoms.Api.Models;

// Datos que la vista Home/Index muestra en el panel
public class PanelViewModel
{
    public bool Connected { get; set; }
    public List<PanelCity> Cities { get; set; } = new();
}

public class PanelCity
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public int X { get; set; }
    public int Y { get; set; }
    public List<ResourceResponse> Resources { get; set; } = new();
    public List<BuildingResponse> Buildings { get; set; } = new();
}
