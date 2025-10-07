namespace BasketballScoreboardAPI.Models
{
    public class PartidoJugador
    {
        public int Id { get; set; }
        public int PartidoId { get; set; }
        public int EquipoId { get; set; }
        public int JugadorId { get; set; }

        // Navigation properties
        public Partido Partido { get; set; } = null!;
        public Equipo Equipo { get; set; } = null!;
        public Jugador Jugador { get; set; } = null!;
    }
}
