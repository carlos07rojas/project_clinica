package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class HorarioCitasResponseDTO {
    private Integer idHorario;
    private Integer idMedico;
    private String nombreMedico;
    private Integer diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
}
