package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialClinicoRepository 
    extends JpaRepository<HistorialClinico, Integer>{
    
    @Query("SELECT h FROM HistorialClinico h WHERE h.cita.idCita = :idCita")
    Optional<HistorialClinico> findByCitaId(@Param("idCita") Integer idCita);

    // Trae los hostoriales o historial completo por paciente
    @Query("SELECT h FROM HistorialClinico h WHERE h.cita.paciente.idPaciente = :idPaciente")
    List<HistorialClinico> findHistorialPorPaciente(@Param("idPaciente") Integer idPaciente);
    // ffindHistorialPorPaciente = esto es una forma de navegar en las relaciones entre entidades
    // entonces Spring o JPA lo interpreta como una ruta de navegacion entre objetos
}
