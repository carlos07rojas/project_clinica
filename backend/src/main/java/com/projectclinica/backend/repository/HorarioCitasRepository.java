package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.HorarioCitas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HorarioCitasRepository 
    extends JpaRepository<HorarioCitas, Integer>{
    
    //  Busca todos los horario de un medico | dato mucho de un mismo tipo
    List<HorarioCitas> findByMedicoIdMedico(Integer idMedico);

    // Busca o trae todo los horarios activos de un medico en un dia especifico
    List<HorarioCitas> findByMedicoIdMedicoAndDiaSemanaAndActivoTrue(Integer idMedico, Integer diaSemana);
}
