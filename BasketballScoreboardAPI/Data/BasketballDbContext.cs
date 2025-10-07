using Microsoft.EntityFrameworkCore;
using BasketballScoreboardAPI.Models;

namespace BasketballScoreboardAPI.Data
{
    public class BasketballDbContext : DbContext
    {
        public BasketballDbContext(DbContextOptions<BasketballDbContext> options) : base(options)
        {
        }

        public DbSet<Partido> Partidos { get; set; }
        public DbSet<Falta> Faltas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Equipo> Equipos { get; set; }
        public DbSet<Jugador> Jugadores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Partido entity
            modelBuilder.Entity<Partido>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.EquipoLocal).IsRequired().HasMaxLength(50);
                entity.Property(e => e.EquipoVisitante).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Fecha).HasDefaultValueSql("GETDATE()");
            });

            // Configure Falta entity
            modelBuilder.Entity<Falta>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Equipo).IsRequired().HasMaxLength(50);
                
                // Configure foreign key relationship
                entity.HasOne(f => f.Partido)
                      .WithMany(p => p.Faltas)
                      .HasForeignKey(f => f.PartidoId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Usuario entity
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).HasMaxLength(20);
            });

            // Configure Equipo entity
            modelBuilder.Entity<Equipo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Nombre).IsUnique();
                entity.Property(e => e.Ciudad).HasMaxLength(100);
                entity.Property(e => e.ColorPrimario).HasMaxLength(7);
                entity.Property(e => e.ColorSecundario).HasMaxLength(7);
            });

            // Configure Jugador entity
            modelBuilder.Entity<Jugador>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Posicion).HasMaxLength(20);
                entity.Property(e => e.Nacionalidad).HasMaxLength(50);
                entity.Property(e => e.Altura).HasColumnType("decimal(3,2)");
                entity.Property(e => e.Peso).HasColumnType("decimal(5,2)");
                
                entity.HasOne(j => j.Equipo)
                      .WithMany(e => e.Jugadores)
                      .HasForeignKey(j => j.EquipoId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => new { e.EquipoId, e.Numero }).IsUnique();
            });
        }
    }
}
