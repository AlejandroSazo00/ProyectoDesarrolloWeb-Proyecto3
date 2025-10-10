package com.basketball.teams.service;

import com.basketball.teams.dto.CreateTeamRequest;
import com.basketball.teams.dto.TeamDto;
import com.basketball.teams.dto.UpdateTeamRequest;
import com.basketball.teams.entity.Team;
import com.basketball.teams.exception.TeamNotFoundException;
import com.basketball.teams.exception.DuplicateTeamException;
import com.basketball.teams.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<TeamDto> getAllTeams() {
        log.info("Obteniendo todos los equipos");
        return teamRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TeamDto> getAllTeams(Pageable pageable) {
        log.info("Obteniendo equipos paginados: página {}, tamaño {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        return teamRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getActiveTeams() {
        log.info("Obteniendo equipos activos");
        return teamRepository.findByActivoTrue()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamDto getTeamById(Long id) {
        log.info("Obteniendo equipo por ID: {}", id);
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con ID: " + id));
        return convertToDto(team);
    }

    @Transactional(readOnly = true)
    public TeamDto getTeamByName(String nombre) {
        log.info("Obteniendo equipo por nombre: {}", nombre);
        Team team = teamRepository.findByNombreIgnoreCase(nombre)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con nombre: " + nombre));
        return convertToDto(team);
    }

    public TeamDto createTeam(CreateTeamRequest request) {
        log.info("Creando nuevo equipo: {}", request.getNombre());
        
        // Verificar que no exista un equipo con el mismo nombre
        if (teamRepository.existsByNombreIgnoreCaseAndActivoTrue(request.getNombre())) {
            throw new DuplicateTeamException("Ya existe un equipo activo con el nombre: " + request.getNombre());
        }

        Team team = new Team();
        team.setNombre(request.getNombre());
        team.setCiudad(request.getCiudad());
        team.setLogoUrl(request.getLogoUrl());
        team.setColorPrimario(request.getColorPrimario());
        team.setColorSecundario(request.getColorSecundario());
        team.setDescripcion(request.getDescripcion());
        team.setEntrenador(request.getEntrenador());
        team.setFundadoEn(request.getFundadoEn());
        team.setEstadio(request.getEstadio());
        team.setActivo(true);

        Team savedTeam = teamRepository.save(team);
        log.info("Equipo creado exitosamente con ID: {}", savedTeam.getId());
        
        return convertToDto(savedTeam);
    }

    public TeamDto updateTeam(Long id, UpdateTeamRequest request) {
        log.info("Actualizando equipo con ID: {}", id);
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con ID: " + id));

        // Verificar nombre duplicado si se está cambiando
        if (request.getNombre() != null && !request.getNombre().equals(team.getNombre())) {
            if (teamRepository.existsByNombreIgnoreCaseAndIdNot(request.getNombre(), id)) {
                throw new DuplicateTeamException("Ya existe otro equipo con el nombre: " + request.getNombre());
            }
            team.setNombre(request.getNombre());
        }

        // Actualizar campos si están presentes
        if (request.getCiudad() != null) {
            team.setCiudad(request.getCiudad());
        }
        if (request.getLogoUrl() != null) {
            team.setLogoUrl(request.getLogoUrl());
        }
        if (request.getColorPrimario() != null) {
            team.setColorPrimario(request.getColorPrimario());
        }
        if (request.getColorSecundario() != null) {
            team.setColorSecundario(request.getColorSecundario());
        }
        if (request.getActivo() != null) {
            team.setActivo(request.getActivo());
        }
        if (request.getDescripcion() != null) {
            team.setDescripcion(request.getDescripcion());
        }
        if (request.getEntrenador() != null) {
            team.setEntrenador(request.getEntrenador());
        }
        if (request.getFundadoEn() != null) {
            team.setFundadoEn(request.getFundadoEn());
        }
        if (request.getEstadio() != null) {
            team.setEstadio(request.getEstadio());
        }

        Team updatedTeam = teamRepository.save(team);
        log.info("Equipo actualizado exitosamente: {}", updatedTeam.getId());
        
        return convertToDto(updatedTeam);
    }

    public void deleteTeam(Long id) {
        log.info("Eliminando equipo con ID: {}", id);
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con ID: " + id));

        teamRepository.delete(team);
        log.info("Equipo eliminado exitosamente: {}", id);
    }

    public TeamDto activateTeam(Long id) {
        log.info("Activando equipo con ID: {}", id);
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con ID: " + id));

        team.activar();
        Team updatedTeam = teamRepository.save(team);
        
        return convertToDto(updatedTeam);
    }

    public TeamDto deactivateTeam(Long id) {
        log.info("Desactivando equipo con ID: {}", id);
        
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Equipo no encontrado con ID: " + id));

        team.desactivar();
        Team updatedTeam = teamRepository.save(team);
        
        return convertToDto(updatedTeam);
    }

    @Transactional(readOnly = true)
    public Page<TeamDto> searchTeams(String searchTerm, Pageable pageable) {
        log.info("Buscando equipos con término: {}", searchTerm);
        return teamRepository.findByNombreOrCiudadContaining(searchTerm, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<TeamDto> getTeamsWithFilters(String nombre, String ciudad, Boolean activo, Pageable pageable) {
        log.info("Obteniendo equipos con filtros - nombre: {}, ciudad: {}, activo: {}", nombre, ciudad, activo);
        return teamRepository.findWithFilters(nombre, ciudad, activo, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public long getTotalTeams() {
        return teamRepository.count();
    }

    @Transactional(readOnly = true)
    public long getActiveTeamsCount() {
        return teamRepository.countByActivoTrue();
    }

    private TeamDto convertToDto(Team team) {
        TeamDto dto = new TeamDto();
        dto.setId(team.getId());
        dto.setNombre(team.getNombre());
        dto.setCiudad(team.getCiudad());
        dto.setLogoUrl(team.getLogoUrl());
        dto.setColorPrimario(team.getColorPrimario());
        dto.setColorSecundario(team.getColorSecundario());
        dto.setActivo(team.getActivo());
        dto.setDescripcion(team.getDescripcion());
        dto.setEntrenador(team.getEntrenador());
        dto.setFundadoEn(team.getFundadoEn());
        dto.setEstadio(team.getEstadio());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        return dto;
    }
}
