package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository 
    extends JpaRepository<Cita, Integer>{
    
    // Trae citas de un paciente en especifico
    List<Cita> findByPacienteIdPaciente(Integer idPaciente);

    // Trae citas de un medico en especifico
    List<Cita> findByMedicoIdMedico(Integer idMedico);

    // Trae citas por estado (PENDIENTE, CONFIRMADA, etc.)
    List<Cita> findByEstado(String estado);
    
    // verifica si un médico ya tiene una cita en esa fecha y hora
    boolean existsByMedicoIdMedicoAndFechaHora(Integer idMedico, LocalDateTime fechaHora);
}
