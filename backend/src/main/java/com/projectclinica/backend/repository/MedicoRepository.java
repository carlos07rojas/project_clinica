package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository 
    extends JpaRepository<Medico, Integer>{

    // Busca la lista de medicos por especialidad | dato muchos de un mismo tipo
    List<Medico> findByEspecialidadIdEspecialidad(Integer idEspecialidad);
    
    // Busca por el codigo de colegiatura | dato unico existente o no existente
    Optional<Medico> findByCodigoColegiatura(String codigo);

    boolean existsByCodigoColegiatura(String codigo);
}
