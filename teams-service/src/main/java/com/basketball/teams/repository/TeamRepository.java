package com.basketball.teams.repository;

import com.basketball.teams.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    // Buscar por nombre (case insensitive)
    Optional<Team> findByNombreIgnoreCase(String nombre);

    // Verificar si existe un equipo con el nombre (excluyendo un ID específico)
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    // Buscar equipos activos
    List<Team> findByActivoTrue();

    // Buscar equipos por ciudad
    List<Team> findByCiudadIgnoreCaseContaining(String ciudad);

    // Buscar equipos activos paginados
    Page<Team> findByActivoTrue(Pageable pageable);

    // Buscar equipos por estado (activo/inactivo)
    Page<Team> findByActivo(Boolean activo, Pageable pageable);

    // Búsqueda por nombre o ciudad (case insensitive)
    @Query("SELECT t FROM Team t WHERE " +
           "LOWER(t.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.ciudad) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Team> findByNombreOrCiudadContaining(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Búsqueda avanzada con filtros
    @Query("SELECT t FROM Team t WHERE " +
           "(:nombre IS NULL OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:ciudad IS NULL OR LOWER(t.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%'))) AND " +
           "(:activo IS NULL OR t.activo = :activo)")
    Page<Team> findWithFilters(@Param("nombre") String nombre,
                              @Param("ciudad") String ciudad,
                              @Param("activo") Boolean activo,
                              Pageable pageable);

    // Contar equipos activos
    long countByActivoTrue();

    // Contar equipos por ciudad
    long countByCiudadIgnoreCase(String ciudad);

    // Obtener equipos ordenados por fecha de creación
    List<Team> findTop10ByOrderByCreatedAtDesc();

    // Buscar equipos fundados en un rango de años
    @Query("SELECT t FROM Team t WHERE t.fundadoEn BETWEEN :yearFrom AND :yearTo")
    List<Team> findByFundadoEnBetween(@Param("yearFrom") Integer yearFrom, 
                                     @Param("yearTo") Integer yearTo);

    // Verificar si existe un equipo activo con el nombre
    boolean existsByNombreIgnoreCaseAndActivoTrue(String nombre);
}
