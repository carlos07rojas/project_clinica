package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PacienteRequestDTO {
    private Integer idUsuario;
    private String dni;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String direccion;
    private String sexo;
}
