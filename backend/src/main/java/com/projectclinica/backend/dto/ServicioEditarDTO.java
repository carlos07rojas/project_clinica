package com.projectclinica.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServicioEditarDTO {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer duracionMin;
}