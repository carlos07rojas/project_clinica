package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PacienteRepository 
    extends JpaRepository<Paciente, Integer>{

    Optional<Paciente> findByDni(String dni);
    
    // buscar paciente por su usuario asociado
    Optional<Paciente> findByUsuarioIdUsuario(Integer idUsuario);
    // Usuario = campo en Paciente
    // IdUsuario = campo del objeto Usuario

    boolean existsByDni(String dni);    
} 