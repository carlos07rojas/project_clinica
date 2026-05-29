package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.MedicoEspecialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicoEspecialidadRepository extends JpaRepository<MedicoEspecialidad, Integer> {
    @Query("SELECT me FROM MedicoEspecialidad me " +
            "WHERE me.medico.idMedico = :idMedico " +
            "AND me.activo = true")
    List<MedicoEspecialidad> findActivasByMedico(@Param("idMedico") Integer idMedico);

    @Query("SELECT me FROM MedicoEspecialidad me " +
            "WHERE me.especialidad.idEspecialidad = :idEspecialidad " +
            "AND me.activo = true")
    List<MedicoEspecialidad> findActivasByEspecialidad(@Param("idEspecialidad") Integer idEspecialidad);

    @Query("SELECT COUNT(me) > 0 FROM MedicoEspecialidad me " +
            "WHERE me.medico.idMedico = :idMedico " +
            "AND me.especialidad.idEspecialidad = :idEspecialidad " +
            "AND me.activo = true")
    Boolean existeRelacionActiva(@Param("idMedico") Integer idMedico, @Param("idEspecialidad") Integer idEspecialidad);

    @Query("SELECT COUNT(me) FROM MedicoEspecialidad me " +
            "WHERE me.especialidad.idEspecialidad = :idEspecialidad " +
            "AND me.activo = true")
    long contarMedicosActivos(@Param("idEspecialidad") Integer idEspecialidad);
}
