using BasketballScoreboardAPI.Models;
using BasketballScoreboardAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace BasketballScoreboardAPI.Data
{
    public static class SeedAdmin
    {
        public static async Task RunAsync(IServiceProvider sp)
        {
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<BasketballDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();

            if (!await db.Usuarios.AnyAsync(u => u.Role == "Admin"))
            {
                var admin = new Usuario
                {
                    Username = "admin",
                    PasswordHash = hasher.Hash("Admin123!"),
                    Role = "Admin",
                    IsActive = true
                };
                db.Usuarios.Add(admin);
                await db.SaveChangesAsync();
            }
        }
    }
}
