namespace BasketballScoreboardAPI.Models
{
    public class Jugador
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Numero { get; set; }
        public string? Posicion { get; set; }
        public decimal? Altura { get; set; } // en metros
        public decimal? Peso { get; set; } // en kg
        public DateTime? FechaNacimiento { get; set; }
        public string? Nacionalidad { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int EquipoId { get; set; }
        public Equipo Equipo { get; set; } = null!;
    }
}
