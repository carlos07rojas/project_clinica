package com.projectclinica.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class MedicoResponseDTO {
    private Integer idMedico;
    private String nombre;
    private String apellido;
    private String email;
    private String codigoColegiatura;
    private String telefono;
    private List<EspecialidadResponseDTO> idEspecialidades;
}
