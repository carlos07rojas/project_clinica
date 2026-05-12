package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.HorarioCitas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HorarioCitasRepository
        extends JpaRepository<HorarioCitas, Integer> {

    // Busca todos los horario de un medico | dato mucho de un mismo tipo
    @Query("SELECT h FROM HorarioCitas h WHERE h.medico.idMedico = :idMedico")
    List<HorarioCitas> findByMedicoId(@Param("idMedico") Integer idMedico);

    // Busca o trae todo los horarios activos de un medico en un dia especifico
    @Query("SELECT h FROM HorarioCitas h WHERE h.medico.idMedico = :idMedico AND h.diaSemana = :dia AND h.activo = true")
    List<HorarioCitas> findHorariosActivosPorMedicoYDia(
            @Param("idMedico") Integer idMedico,
            @Param("dia") Integer diaSemana);

    @Query("SELECT h FROM HorarioCitas h WHERE " +
            "h.medico.idMedico = :idMedico AND " +
            "h.diaSemana = :diaSemana AND " +
            "h.activo = true AND " +
            "h.fechaInicio <= :fechaFin AND " +
            "h.fechaFin >= :fechaInicio")
    List<HorarioCitas> findHorariosSolapados(
            @Param("idMedico") Integer idMedico,
            @Param("diaSemana") Integer diaSemana,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);
}
