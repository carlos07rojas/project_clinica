package com.projectclinica.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class MedicoRequestDTO {
    private Integer idUsuario;
    private String codigoColegiatura;
    private List<Integer> idEspecialidades;
    private String telefono;
}
