package com.projectclinica.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "PACIENTE")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Integer idPaciente;

    @OneToOne //permite la relacion de uno a uno
    @JoinColumn(name = "id_usuario", nullable = false, unique = true) //JoinColumn especifica el nombre de la columna que actua como FK y el UNIQUE garantiza la relacion entre las tablas y sin repeticion
    private Usuario usuario;

    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "fecha_nacimiento", nullabre = false)
    private LocalDate fechaNacimiento;

    @Column(name = "telefono", lenght = 9)
    private String telefono;

    @Column(name = "direccion", lenght = 250)
    private String direccion;

    @Column(name = "sexo", nullable = false, lenght = 1)
    private String sexo;
}