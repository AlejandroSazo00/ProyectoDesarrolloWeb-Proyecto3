using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasketballScoreboardAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEquiposJugadores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EquipoLocalId",
                table: "Partidos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EquipoVisitanteId",
                table: "Partidos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MarcadorFinalLocal",
                table: "Partidos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MarcadorFinalVisitante",
                table: "Partidos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Equipos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ciudad = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ColorPrimario = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    ColorSecundario = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Jugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Numero = table.Column<int>(type: "int", nullable: false),
                    Posicion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Altura = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    Peso = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Nacionalidad = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EquipoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jugadores_Equipos_EquipoId",
                        column: x => x.EquipoId,
                        principalTable: "Equipos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Equipos_Nombre",
                table: "Equipos",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jugadores_EquipoId_Numero",
                table: "Jugadores",
                columns: new[] { "EquipoId", "Numero" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Jugadores");

            migrationBuilder.DropTable(
                name: "Equipos");

            migrationBuilder.DropColumn(
                name: "EquipoLocalId",
                table: "Partidos");

            migrationBuilder.DropColumn(
                name: "EquipoVisitanteId",
                table: "Partidos");

            migrationBuilder.DropColumn(
                name: "MarcadorFinalLocal",
                table: "Partidos");

            migrationBuilder.DropColumn(
                name: "MarcadorFinalVisitante",
                table: "Partidos");
        }
    }
}
