package com.projectclinica.backend.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class HorarioCitasRequestDTO {
    private Integer idMedico;
    private Integer diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
