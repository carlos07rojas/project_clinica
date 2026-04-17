package com.projectclinica.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServicioResponseDTO {
    private Integer idServicio;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer duracionMin;
    private Integer idEspecialidad;
    private String nombreEspecialidad;
    private Boolean activo;
}
