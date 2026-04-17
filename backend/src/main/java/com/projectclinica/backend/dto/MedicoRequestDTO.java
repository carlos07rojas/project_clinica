package com.projectclinica.backend.dto;

import lombok.Data;

@Data
public class MedicoRequestDTO {
    private Integer idUsuario;
    private String codigoColegiatura;
    private Integer idEspecialidad;
    private String telefono;
}
