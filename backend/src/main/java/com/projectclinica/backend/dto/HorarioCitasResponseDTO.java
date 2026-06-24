package com.projectclinica.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class HorarioCitasResponseDTO {
    private Integer idHorario;
    private Integer idMedico;
    private Integer idEspecialidad;
    private String nombreEspecialidad;
    private String nombreMedico;
    private Integer diaSemana;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
}
