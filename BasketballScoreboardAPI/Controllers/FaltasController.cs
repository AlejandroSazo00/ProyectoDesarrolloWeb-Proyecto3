using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Models;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaltasController : ControllerBase
    {
        private readonly BasketballDbContext _context;

        public FaltasController(BasketballDbContext context)
        {
            _context = context;
        }

        // POST: api/faltas
        [HttpPost]
        public async Task<ActionResult<Falta>> UpdateFaltas(UpdateFaltasDto dto)
        {
            var falta = await _context.Faltas
                .FirstOrDefaultAsync(f => f.PartidoId == dto.PartidoId && f.Equipo == dto.Equipo);

            if (falta == null)
            {
                // Create new falta record if it doesn't exist
                falta = new Falta
                {
                    PartidoId = dto.PartidoId,
                    Equipo = dto.Equipo,
                    Faltas = dto.Faltas
                };
                _context.Faltas.Add(falta);
            }
            else
            {
                falta.Faltas = dto.Faltas;
            }

            await _context.SaveChangesAsync();
            return Ok(falta);
        }

        // GET: api/faltas/{partidoId}
        [HttpGet("{partidoId}")]
        public async Task<ActionResult<IEnumerable<Falta>>> GetFaltasByPartido(int partidoId)
        {
            var faltas = await _context.Faltas
                .Where(f => f.PartidoId == partidoId)
                .ToListAsync();

            return Ok(faltas);
        }
    }

    public class UpdateFaltasDto
    {
        public int PartidoId { get; set; }
        public string Equipo { get; set; } = string.Empty;
        public int Faltas { get; set; }
    }
}
