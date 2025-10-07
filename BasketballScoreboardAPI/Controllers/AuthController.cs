using BasketballScoreboardAPI.Data;
using BasketballScoreboardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasketballScoreboardAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly BasketballDbContext _db;
        private readonly JwtTokenService _jwt;
        private readonly PasswordHasher _hasher;

        public AuthController(BasketballDbContext db, JwtTokenService jwt, PasswordHasher hasher)
        {
            _db = db; _jwt = jwt; _hasher = hasher;
        }

        public record LoginRequest(string Username, string Password);

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Usuario y contraseña requeridos");

            var user = await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Username == req.Username);
            if (user == null) return Unauthorized("Credenciales inválidas");
            if (!_hasher.Verify(req.Password, user.PasswordHash)) return Unauthorized("Credenciales inválidas");
            if (!user.IsActive) return Unauthorized("Usuario inactivo");

            var token = _jwt.GenerateToken(user.Id, user.Username, user.Role ?? "Admin", 120);
            var exp = DateTime.UtcNow.AddMinutes(120);
            return Ok(new { token, username = user.Username, role = user.Role, expiresAt = exp });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) return Unauthorized();
            var user = await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized();
            return Ok(new { user.Id, user.Username, user.Role, user.IsActive, user.CreatedAt });
        }
    }
}
