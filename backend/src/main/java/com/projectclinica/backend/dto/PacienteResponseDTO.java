package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PacienteResponseDTO {
    // datos del usuario asociado incluidos directamente para no tener que hacer dos consultas desde el frontend
    private Integer idPaciente;
    private String nombre;
    private String apellido;
    private String email;
    private String dni;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String direccion;
    private String sexo;    
}