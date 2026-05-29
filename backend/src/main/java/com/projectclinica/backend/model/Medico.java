package com.projectclinica.backend.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
// import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "MEDICO")
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medico")
    private Integer idMedico;

    @OneToOne
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "codigo_colegiatura", nullable = false, unique = true, length = 10)
    private String codigoColegiatura;

    @Column(name = "telefono", length = 9)
    private String telefono;

    // un medico tiene muchas especialidades por eso mappedby indica a la FK esta en MedicoEspecialida 
    @OneToMany(mappedBy = "medico")
    private List<MedicoEspecialidad> especialidades;
}