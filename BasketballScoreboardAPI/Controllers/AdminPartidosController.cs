using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/admin/partidos")]
    [Authorize(Roles = "Admin")]
    public class AdminPartidosController : ControllerBase
    {
        private readonly BasketballDbContext _db;
        
        public AdminPartidosController(BasketballDbContext db)
        {
            _db = db;
        }

        public record CreatePartidoRequest(string EquipoLocal, string EquipoVisitante, int? EquipoLocalId, int? EquipoVisitanteId, DateTime? Fecha);
        public record UpdatePartidoRequest(string? EquipoLocal, string? EquipoVisitante, int? EquipoLocalId, int? EquipoVisitanteId, DateTime? Fecha, int? MarcadorFinalLocal, int? MarcadorFinalVisitante);

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 100) pageSize = 20;

            var total = await _db.Partidos.CountAsync();
            var partidos = await _db.Partidos
                .OrderByDescending(p => p.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { 
                partidos, 
                totalCount = total, 
                page, 
                pageSize, 
                totalPages = (int)Math.Ceiling(total / (double)pageSize) 
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var partido = await _db.Partidos
                .Include(p => p.Faltas)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (partido == null) return NotFound();
            return Ok(partido);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePartidoRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.EquipoLocal) || string.IsNullOrWhiteSpace(req.EquipoVisitante))
                return BadRequest("Nombres de equipos son requeridos");

            var partido = new Partido
            {
                EquipoLocal = req.EquipoLocal,
                EquipoVisitante = req.EquipoVisitante,
                EquipoLocalId = req.EquipoLocalId,
                EquipoVisitanteId = req.EquipoVisitanteId,
                PuntosLocal = 0,
                PuntosVisitante = 0,
                CuartoActual = 1,
                TiempoRestante = 600, // 10 minutos
                Fecha = req.Fecha ?? DateTime.Now
            };

            _db.Partidos.Add(partido);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = partido.Id }, partido);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePartidoRequest req)
        {
            var partido = await _db.Partidos.FirstOrDefaultAsync(p => p.Id == id);
            if (partido == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.EquipoLocal)) partido.EquipoLocal = req.EquipoLocal;
            if (!string.IsNullOrWhiteSpace(req.EquipoVisitante)) partido.EquipoVisitante = req.EquipoVisitante;
            if (req.EquipoLocalId.HasValue) partido.EquipoLocalId = req.EquipoLocalId.Value;
            if (req.EquipoVisitanteId.HasValue) partido.EquipoVisitanteId = req.EquipoVisitanteId.Value;
            if (req.Fecha.HasValue) partido.Fecha = req.Fecha.Value;
            if (req.MarcadorFinalLocal.HasValue) partido.MarcadorFinalLocal = req.MarcadorFinalLocal.Value;
            if (req.MarcadorFinalVisitante.HasValue) partido.MarcadorFinalVisitante = req.MarcadorFinalVisitante.Value;

            await _db.SaveChangesAsync();
            return Ok(partido);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var partido = await _db.Partidos.FirstOrDefaultAsync(p => p.Id == id);
            if (partido == null) return NotFound();

            _db.Partidos.Remove(partido);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:int}/finalizar")]
        public async Task<IActionResult> FinalizarPartido(int id, [FromBody] FinalizarPartidoRequest req)
        {
            var partido = await _db.Partidos.FirstOrDefaultAsync(p => p.Id == id);
            if (partido == null) return NotFound();

            partido.MarcadorFinalLocal = req.MarcadorFinalLocal;
            partido.MarcadorFinalVisitante = req.MarcadorFinalVisitante;
            
            await _db.SaveChangesAsync();
            return Ok(partido);
        }

        public record FinalizarPartidoRequest(int MarcadorFinalLocal, int MarcadorFinalVisitante);
    }
}
