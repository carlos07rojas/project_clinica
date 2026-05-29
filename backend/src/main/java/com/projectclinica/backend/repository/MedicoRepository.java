package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MedicoRepository 
    extends JpaRepository<Medico, Integer>{
        
    Optional<Medico> findByUsuarioIdUsuario(Integer idUsuario);
    
    // Busca por el codigo de colegiatura | dato unico existente o no existente
    Optional<Medico> findByCodigoColegiatura(String codigo);

    boolean existsByCodigoColegiatura(String codigo);
}
