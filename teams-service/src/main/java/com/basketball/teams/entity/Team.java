package com.basketball.teams.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, unique = true)
    private String nombre;

    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    @Column
    private String ciudad;

    @Column(name = "logo_url")
    private String logoUrl;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color primario debe ser un código hexadecimal válido")
    @Column(name = "color_primario")
    private String colorPrimario;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color secundario debe ser un código hexadecimal válido")
    @Column(name = "color_secundario")
    private String colorSecundario;

    @Column(nullable = false)
    private Boolean activo = true;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Size(max = 100, message = "El entrenador no puede exceder 100 caracteres")
    @Column
    private String entrenador;

    @Column(name = "fundado_en")
    private Integer fundadoEn;

    @Size(max = 200, message = "El estadio no puede exceder 200 caracteres")
    @Column
    private String estadio;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Métodos de conveniencia
    public boolean isActivo() {
        return activo != null && activo;
    }

    public void activar() {
        this.activo = true;
    }

    public void desactivar() {
        this.activo = false;
    }

    @PrePersist
    protected void onCreate() {
        if (activo == null) {
            activo = true;
        }
        if (colorPrimario == null) {
            colorPrimario = "#3498db";
        }
        if (colorSecundario == null) {
            colorSecundario = "#ffffff";
        }
    }
}
