package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialClinicoRepository 
    extends JpaRepository<HistorialClinico, Integer>{
    
    // Buscar historial por cita
    Optional<HistorialClinico> findByCitaIdCita(Integer idCita);

    // Trae los hostoriales o historial completo por paciente
    List<HistorialClinico> findByCitaPacienteIdPaciente(Integer idPaciente);
    // findByCitaPacienteIdPaciente = esto es una forma de navegar en las relaciones entre entidades
    // entonces Spring o JPA lo interpreta como una ruta de navegacion entre objetos
}
