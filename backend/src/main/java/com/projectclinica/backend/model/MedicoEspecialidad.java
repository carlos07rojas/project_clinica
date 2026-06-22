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

// tabla intermedia medico y especialidad, esto va a permitir que un medico tenga multiples especialidad
@Data
@Entity
@Table(name = "MEDICO_ESPECIALIDAD")
public class MedicoEspecialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_medico", nullable = false)
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "id_especialidad", nullable = false)
    private Especialidad especialidad;

    // tener un borrado lógico permitira quitar una especialidad sin perder el historial de que alguna vez la tuvo
    @Column(name = "activo") 
    private Boolean activo = true;
}
