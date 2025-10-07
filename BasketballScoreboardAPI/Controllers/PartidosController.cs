using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Models;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartidosController : ControllerBase
    {
        private readonly BasketballDbContext _context;

        public PartidosController(BasketballDbContext context)
        {
            _context = context;
        }

        // POST: api/partidos
        [HttpPost]
        public async Task<ActionResult<Partido>> CreatePartido(CreatePartidoDto dto)
        {
            try
            {
                var partido = new Partido
                {
                    EquipoLocal = dto.EquipoLocal ?? "Local",
                    EquipoVisitante = dto.EquipoVisitante ?? "Visitante",
                    PuntosLocal = 0,
                    PuntosVisitante = 0,
                    CuartoActual = 1,
                    TiempoRestante = 600,
                    Fecha = DateTime.Now
                };

                Console.WriteLine($"[DEBUG] Creating partido - Before Save: ID = {partido.Id}");
                _context.Partidos.Add(partido);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] Creating partido - After Save: ID = {partido.Id}");
                Console.WriteLine($"[DEBUG] Returning partido with ID: {partido.Id} to frontend");

                return Ok(partido);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error creating partido: {ex.Message}");
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // GET: api/partidos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Partido>> GetPartido(int id)
        {
            try
            {
                var partido = await _context.Partidos
                    .Include(p => p.Faltas)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (partido == null)
                {
                    return NotFound();
                }

                return partido;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // PUT: api/partidos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePartido(int id, UpdatePartidoDto dto)
        {
            var partido = await _context.Partidos.FindAsync(id);
            if (partido == null)
            {
                return NotFound();
            }

            partido.PuntosLocal = dto.PuntosLocal;
            partido.PuntosVisitante = dto.PuntosVisitante;
            partido.CuartoActual = dto.CuartoActual;
            partido.TiempoRestante = dto.TiempoRestante;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PartidoExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // GET: api/partidos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Partido>>> GetPartidos()
        {
            try
            {
                return await _context.Partidos
                    .Include(p => p.Faltas)
                    .OrderByDescending(p => p.Fecha)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        private bool PartidoExists(int id)
        {
            return _context.Partidos.Any(e => e.Id == id);
        }
    }

    public class CreatePartidoDto
    {
        public string EquipoLocal { get; set; } = string.Empty;
        public string EquipoVisitante { get; set; } = string.Empty;
    }

    public class UpdatePartidoDto
    {
        public int PuntosLocal { get; set; }
        public int PuntosVisitante { get; set; }
        public int CuartoActual { get; set; }
        public int TiempoRestante { get; set; }
    }
}
