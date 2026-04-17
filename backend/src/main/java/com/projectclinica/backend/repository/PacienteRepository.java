package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PacienteRepository 
    extends JpaRepository<Paciente, Integer>{

    Optional<Paciente> findByDni(String dni);
    
    // buscar paciente por su usuario asociado
    @Query("SELECT p FROM Paciente p WHERE p.usuario.idUsuario = :idUsuario")
    Optional<Paciente> findByUsuarioId(@Param("idUsuario") Integer idUsuario);
    // Usuario = campo en Paciente
    // IdUsuario = campo del objeto Usuario

    boolean existsByDni(String dni);    
} 