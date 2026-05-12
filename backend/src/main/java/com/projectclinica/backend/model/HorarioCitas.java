package com.projectclinica.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "HORARIO_CITAS")
public class HorarioCitas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Integer idHorario;

    @ManyToOne
    @JoinColumn(name = "id_medico", nullable = false)
    private Medico medico;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana;

    // fecha desde la cual aplica el horario, no puede ser en el pasado
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    // siempre 6 días después de fechaInicio un horario aplica exactamente una semana
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horarioFin;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}