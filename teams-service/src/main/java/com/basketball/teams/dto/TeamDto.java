package com.basketball.teams.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDto {

    private Long id;

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String ciudad;

    private String logoUrl;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color primario debe ser un código hexadecimal válido")
    private String colorPrimario;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color secundario debe ser un código hexadecimal válido")
    private String colorSecundario;

    private Boolean activo;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    @Size(max = 100, message = "El entrenador no puede exceder 100 caracteres")
    private String entrenador;

    private Integer fundadoEn;

    @Size(max = 200, message = "El estadio no puede exceder 200 caracteres")
    private String estadio;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
