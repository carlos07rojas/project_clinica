package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioRepository 
    extends JpaRepository<Servicio, Integer>{

    List<Servicio> findByActivoTrue();

    // Busca todos los servicios con una especialidad especifica
    List<Servicio> findByEspecialidadIdEspecialidadAndActivoTrue(Integer idEspecialidad);    
}
