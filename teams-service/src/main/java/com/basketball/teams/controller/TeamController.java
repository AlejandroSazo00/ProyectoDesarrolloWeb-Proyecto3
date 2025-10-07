package com.basketball.teams.controller;

import com.basketball.teams.dto.CreateTeamRequest;
import com.basketball.teams.dto.TeamDto;
import com.basketball.teams.dto.UpdateTeamRequest;
import com.basketball.teams.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "API para gestión de equipos de basketball")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Obtener todos los equipos", description = "Retorna una lista paginada de todos los equipos")
    @ApiResponse(responseCode = "200", description = "Lista de equipos obtenida exitosamente")
    public ResponseEntity<Page<TeamDto>> getAllTeams(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) Boolean activo) {
        
        Page<TeamDto> teams = teamService.getTeamsWithFilters(nombre, ciudad, activo, pageable);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/active")
    @Operation(summary = "Obtener equipos activos", description = "Retorna una lista de todos los equipos activos")
    @ApiResponse(responseCode = "200", description = "Lista de equipos activos obtenida exitosamente")
    public ResponseEntity<List<TeamDto>> getActiveTeams() {
        List<TeamDto> teams = teamService.getActiveTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener equipo por ID", description = "Retorna un equipo específico por su ID")
    @ApiResponse(responseCode = "200", description = "Equipo encontrado")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    public ResponseEntity<TeamDto> getTeamById(
            @Parameter(description = "ID del equipo") @PathVariable Long id) {
        TeamDto team = teamService.getTeamById(id);
        return ResponseEntity.ok(team);
    }

    @GetMapping("/name/{nombre}")
    @Operation(summary = "Obtener equipo por nombre", description = "Retorna un equipo específico por su nombre")
    @ApiResponse(responseCode = "200", description = "Equipo encontrado")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    public ResponseEntity<TeamDto> getTeamByName(
            @Parameter(description = "Nombre del equipo") @PathVariable String nombre) {
        TeamDto team = teamService.getTeamByName(nombre);
        return ResponseEntity.ok(team);
    }

    @PostMapping
    @Operation(summary = "Crear nuevo equipo", description = "Crea un nuevo equipo en el sistema")
    @ApiResponse(responseCode = "201", description = "Equipo creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Ya existe un equipo con ese nombre")
    public ResponseEntity<TeamDto> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        TeamDto createdTeam = teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar equipo", description = "Actualiza un equipo existente")
    @ApiResponse(responseCode = "200", description = "Equipo actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    @ApiResponse(responseCode = "409", description = "Ya existe un equipo con ese nombre")
    public ResponseEntity<TeamDto> updateTeam(
            @Parameter(description = "ID del equipo") @PathVariable Long id,
            @Valid @RequestBody UpdateTeamRequest request) {
        TeamDto updatedTeam = teamService.updateTeam(id, request);
        return ResponseEntity.ok(updatedTeam);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar equipo", description = "Elimina un equipo del sistema")
    @ApiResponse(responseCode = "204", description = "Equipo eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    public ResponseEntity<Void> deleteTeam(
            @Parameter(description = "ID del equipo") @PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activar equipo", description = "Activa un equipo desactivado")
    @ApiResponse(responseCode = "200", description = "Equipo activado exitosamente")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    public ResponseEntity<TeamDto> activateTeam(
            @Parameter(description = "ID del equipo") @PathVariable Long id) {
        TeamDto activatedTeam = teamService.activateTeam(id);
        return ResponseEntity.ok(activatedTeam);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desactivar equipo", description = "Desactiva un equipo activo")
    @ApiResponse(responseCode = "200", description = "Equipo desactivado exitosamente")
    @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    public ResponseEntity<TeamDto> deactivateTeam(
            @Parameter(description = "ID del equipo") @PathVariable Long id) {
        TeamDto deactivatedTeam = teamService.deactivateTeam(id);
        return ResponseEntity.ok(deactivatedTeam);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar equipos", description = "Busca equipos por nombre o ciudad")
    @ApiResponse(responseCode = "200", description = "Resultados de búsqueda obtenidos exitosamente")
    public ResponseEntity<Page<TeamDto>> searchTeams(
            @Parameter(description = "Término de búsqueda") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TeamDto> teams = teamService.searchTeams(q, pageable);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas de equipos", description = "Retorna estadísticas generales de equipos")
    @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente")
    public ResponseEntity<Map<String, Object>> getTeamStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTeams", teamService.getTotalTeams());
        stats.put("activeTeams", teamService.getActiveTeamsCount());
        stats.put("inactiveTeams", teamService.getTotalTeams() - teamService.getActiveTeamsCount());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Verifica el estado del servicio")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "teams-service");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }
}
