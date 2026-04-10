package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository 
    extends JpaRepository<Pago, Integer>{
        
    // buscar pago por cita
    Optional<Pago> findByCitaIdCita(Integer idCita);

    // Trae una lista de pagos segun su estado
    List<Pago> findByEstadoPago(String estadoPago);
    
    // verificar si una cita ya tiene pago
    boolean existsByCitaIdCita(Integer idCita);
}
