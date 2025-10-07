using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/equipos")]
    public class EquiposController : ControllerBase
    {
        private readonly BasketballDbContext _db;
        
        public EquiposController(BasketballDbContext db)
        {
            _db = db;
        }

        public record CreateEquipoRequest(string Nombre, string? Ciudad, string? LogoUrl, string? ColorPrimario, string? ColorSecundario);
        public record UpdateEquipoRequest(string? Nombre, string? Ciudad, string? LogoUrl, string? ColorPrimario, string? ColorSecundario, bool? Activo);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var equipos = await _db.Equipos
                .Where(e => e.Activo)
                .OrderBy(e => e.Nombre)
                .ToListAsync();
            return Ok(equipos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var equipo = await _db.Equipos.FirstOrDefaultAsync(e => e.Id == id);
            if (equipo == null) return NotFound();
            return Ok(equipo);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateEquipoRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nombre))
                return BadRequest("Nombre es requerido");

            if (await _db.Equipos.AnyAsync(e => e.Nombre == req.Nombre))
                return Conflict("Ya existe un equipo con ese nombre");

            var equipo = new Equipo
            {
                Nombre = req.Nombre,
                Ciudad = req.Ciudad,
                LogoUrl = req.LogoUrl,
                ColorPrimario = req.ColorPrimario,
                ColorSecundario = req.ColorSecundario,
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Equipos.Add(equipo);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = equipo.Id }, equipo);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEquipoRequest req)
        {
            var equipo = await _db.Equipos.FirstOrDefaultAsync(e => e.Id == id);
            if (equipo == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.Nombre)) equipo.Nombre = req.Nombre;
            if (req.Ciudad != null) equipo.Ciudad = req.Ciudad;
            if (req.LogoUrl != null) equipo.LogoUrl = req.LogoUrl;
            if (req.ColorPrimario != null) equipo.ColorPrimario = req.ColorPrimario;
            if (req.ColorSecundario != null) equipo.ColorSecundario = req.ColorSecundario;
            if (req.Activo.HasValue) equipo.Activo = req.Activo.Value;

            await _db.SaveChangesAsync();
            return Ok(equipo);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var equipo = await _db.Equipos.FirstOrDefaultAsync(e => e.Id == id);
            if (equipo == null) return NotFound();

            _db.Equipos.Remove(equipo);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
