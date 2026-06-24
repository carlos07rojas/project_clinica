package com.projectclinica.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class HorarioCitasRequestDTO {
    private Integer idMedico;
    private Integer idEspecialidad;
    private Integer diaSemana;
    private LocalDate fechaInicio;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
