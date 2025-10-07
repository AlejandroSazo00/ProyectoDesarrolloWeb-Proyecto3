using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BasketballScoreboardAPI.Models
{
    public class Partido
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string EquipoLocal { get; set; } = string.Empty;

        public int PuntosLocal { get; set; }

        [Required]
        [MaxLength(50)]
        public string EquipoVisitante { get; set; } = string.Empty;

        public int PuntosVisitante { get; set; }

        // Admin fields for partido management
        public int? EquipoLocalId { get; set; }
        public int? EquipoVisitanteId { get; set; }
        public int? MarcadorFinalLocal { get; set; }
        public int? MarcadorFinalVisitante { get; set; }

        public int CuartoActual { get; set; }

        public int TiempoRestante { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        // Navigation property
        public virtual ICollection<Falta> Faltas { get; set; } = new List<Falta>();
    }
}
