namespace BasketballScoreboardAPI.Models
{
    /// <summary>
    /// Modelo de Equipo - representa un equipo de baloncesto con sus propiedades visuales
    /// </summary>
    public class Equipo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Ciudad { get; set; }
        public string? LogoUrl { get; set; }
        
        // Colores para personalizar la apariencia del marcador
        public string? ColorPrimario { get; set; }    // Color principal (ej: #FF5722)
        public string? ColorSecundario { get; set; }  // Color secundario (ej: #FFC107)
        
        public bool Activo { get; set; } = true;      // Para soft delete
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relación con jugadores - un equipo tiene muchos jugadores
        public ICollection<Jugador> Jugadores { get; set; } = new List<Jugador>();
    }
}
