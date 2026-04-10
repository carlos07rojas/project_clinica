package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EspecialidadRepository 
    extends JpaRepository<Especialidad, Integer>{
    
    // traer solo las especialidades activas
    // en SQL seria = SELECT * FROM ESPECIALIDAD WHERE activo = true
    List<Especialidad> findByActivoTrue();

    boolean existsByNombre(String nombre);        
} 
