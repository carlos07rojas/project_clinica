package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository 
    extends JpaRepository<Cita, Integer>{
    
    // Trae citas de un paciente en especifico
    @Query("SELECT c FROM Cita c WHERE c.paciente.idPaciente = :idPaciente")
    List<Cita> findByPacienteId(@Param("idPaciente")Integer idPaciente);

    // Trae citas de un medico en especifico
    @Query("SELECT c FROM Cita c WHERE c.medico.idMedico = :idMedico")
    List<Cita> findByMedicoId(@Param("idMedico") Integer idMedico);

    // Trae citas por estado (PENDIENTE, CONFIRMADA, etc.)
    List<Cita> findByEstado(String estado);
    
    /// verificar si un médico ya tiene cita en esa fecha
    @Query("SELECT COUNT(c) > 0 FROM Cita c WHERE c.medico.idMedico = :idMedico AND c.fechaHora = :fechaHora")
    boolean existeCitaEnHorario(
        @Param("idMedico") Integer idMedico,
        @Param("fechaHora") LocalDateTime fechaHora);
}
