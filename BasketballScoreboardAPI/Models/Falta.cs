using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BasketballScoreboardAPI.Models
{
    public class Falta
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey("Partido")]
        public int PartidoId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Equipo { get; set; } = string.Empty;

        public int Faltas { get; set; }

        // Navigation property - Ignore to prevent circular reference
        [JsonIgnore]
        public virtual Partido Partido { get; set; } = null!;
    }
}
