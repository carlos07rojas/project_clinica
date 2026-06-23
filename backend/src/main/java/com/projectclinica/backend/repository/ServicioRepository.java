package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioRepository 
    extends JpaRepository<Servicio, Integer>{

    List<Servicio> findByActivoTrue();

    // Busca todos los servicios con una especialidad especifica
    @Query("SELECT s FROM Servicio s WHERE s.especialidad.idEspecialidad = :idEspecialidad AND s.activo = true")
    List<Servicio> findActivosPorEspecialidad(@Param("idEspecialidad") Integer idEspecialidad);

    boolean existsByNombre(String nombre);
}
