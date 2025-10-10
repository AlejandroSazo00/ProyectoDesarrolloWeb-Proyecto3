using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/jugadores")]
    public class JugadoresController : ControllerBase
    {
        private readonly BasketballDbContext _db;
        
        public JugadoresController(BasketballDbContext db)
        {
            _db = db;
        }

        public record CreateJugadorRequest(string Nombre, int Numero, int EquipoId, string? Posicion, decimal? Altura, decimal? Peso, DateTime? FechaNacimiento, string? Nacionalidad);
        public record UpdateJugadorRequest(string? Nombre, int? Numero, int? EquipoId, string? Posicion, decimal? Altura, decimal? Peso, DateTime? FechaNacimiento, string? Nacionalidad, bool? Activo);

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? equipoId = null)
        {
            try
            {
                var jugadores = await _db.Jugadores
                    .Include(j => j.Equipo)
                    .Where(j => j.Activo && (equipoId == null || j.EquipoId == equipoId))
                    .OrderBy(j => j.Nombre)
                    .ToListAsync();
                    
                return Ok(jugadores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading jugadores: {ex.Message}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var jugador = await _db.Jugadores
                .Include(j => j.Equipo)
                .FirstOrDefaultAsync(j => j.Id == id);
            if (jugador == null) return NotFound();
            return Ok(jugador);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateJugadorRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nombre))
                return BadRequest("Nombre es requerido");

            if (!await _db.Equipos.AnyAsync(e => e.Id == req.EquipoId))
                return BadRequest("Equipo no existe");

            if (await _db.Jugadores.AnyAsync(j => j.EquipoId == req.EquipoId && j.Numero == req.Numero))
                return Conflict("Ya existe un jugador con ese número en el equipo");

            var jugador = new Jugador
            {
                Nombre = req.Nombre,
                Numero = req.Numero,
                EquipoId = req.EquipoId,
                Posicion = req.Posicion,
                Altura = req.Altura,
                Peso = req.Peso,
                FechaNacimiento = req.FechaNacimiento,
                Nacionalidad = req.Nacionalidad,
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Jugadores.Add(jugador);
            await _db.SaveChangesAsync();
            
            var jugadorCreated = await _db.Jugadores
                .Include(j => j.Equipo)
                .FirstAsync(j => j.Id == jugador.Id);
                
            return CreatedAtAction(nameof(GetById), new { id = jugador.Id }, jugadorCreated);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateJugadorRequest req)
        {
            var jugador = await _db.Jugadores.FirstOrDefaultAsync(j => j.Id == id);
            if (jugador == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.Nombre)) jugador.Nombre = req.Nombre;
            if (req.Numero.HasValue) jugador.Numero = req.Numero.Value;
            if (req.EquipoId.HasValue) jugador.EquipoId = req.EquipoId.Value;
            if (req.Posicion != null) jugador.Posicion = req.Posicion;
            if (req.Altura.HasValue) jugador.Altura = req.Altura.Value;
            if (req.Peso.HasValue) jugador.Peso = req.Peso.Value;
            if (req.FechaNacimiento.HasValue) jugador.FechaNacimiento = req.FechaNacimiento.Value;
            if (req.Nacionalidad != null) jugador.Nacionalidad = req.Nacionalidad;
            if (req.Activo.HasValue) jugador.Activo = req.Activo.Value;

            await _db.SaveChangesAsync();
            
            var jugadorUpdated = await _db.Jugadores
                .Include(j => j.Equipo)
                .FirstAsync(j => j.Id == id);
                
            return Ok(jugadorUpdated);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var jugador = await _db.Jugadores.FirstOrDefaultAsync(j => j.Id == id);
            if (jugador == null) return NotFound();

            _db.Jugadores.Remove(jugador);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
