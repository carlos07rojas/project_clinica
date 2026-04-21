package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.PagoRequestDTO;
import com.projectclinica.backend.dto.PagoResponseDTO;
import com.projectclinica.backend.model.Cita;
import com.projectclinica.backend.model.Pago;
import com.projectclinica.backend.repository.CitaRepository;
import com.projectclinica.backend.repository.PagoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagoService {
    private final PagoRepository pagoRepository;
    private final CitaRepository citaRepository;

    public PagoService(PagoRepository pagoRepository, CitaRepository citaRepository) {
        this.pagoRepository = pagoRepository;
        this.citaRepository = citaRepository;
    }

    // poder registrar pago
    public PagoResponseDTO registrarPago(PagoRequestDTO dto) {
        // para registrar el pago la cita debe existir
        Cita cita = citaRepository.findById(dto.getIdCita()).orElseThrow(() -> new RuntimeException(
                "Cita " + dto.getIdCita() + " no encontrada"));

        // una vez cobrada una cita no se puede cobrar dos veces
        if (pagoRepository.existsByCitaIdCita(dto.getIdCita())) {
            throw new RuntimeException(
                    "La cita ya tiene un pago registrado");
        }

        // el monto del pago tiene que ser mayor a cero
        String metodo = dto.getMetodoPago().toUpperCase();
        if (!metodo.equals("EFECTIVO") &&
                !metodo.equals("TARJETA") &&
                !metodo.equals("TRANSFERENCIA")) {
            throw new RuntimeException(
                    "Método de pago inválido. Debe ser EFECTIVO, TARJETA o TRANSFERENCIA");
        }

        Pago pago = new Pago();
        pago.setCita(cita);
        pago.setMonto(dto.getMonto());
        pago.setMetodoPago(metodo);

        Pago guardado = pagoRepository.save(pago);
        return convertirAResponseDTO(guardado);
    }
    
    // para confirmar pago
    public PagoResponseDTO confirmarPago(Integer idPago) {
        Pago pago = pagoRepository.findById(idPago).orElseThrow(() -> new RuntimeException(
                "El pago " + idPago + " no fue encontrado"));

        // solo se puede confirmar si esta PENDIENTe
        if (!pago.getEstadoPago().equals("PENDIENTE")) {
            throw new RuntimeException(
                    "Solo se pueden confirmar pagos en estodo PENDIENTE. Estado actual: " + pago.getEstadoPago());
        }
        pago.setEstadoPago("PAGADO");
        // se registra la fecha exacta para la contabilidad clinica
        pago.setFechaPago(LocalDateTime.now());

        Pago actualizado = pagoRepository.save(pago);
        return convertirAResponseDTO(actualizado);
    }
    
    //  para anular pago
    public PagoResponseDTO anularPago(Integer idPago) {
        Pago pago = pagoRepository.findById(idPago).orElseThrow(() -> new RuntimeException(
                "Pago " + idPago + " no encontrado"));
        // solo se puede anular un pago si esta en estado PENDIENTE
        if (!pago.getEstadoPago().equals("PENDIENTE")) {
            throw new RuntimeException(
                    "Solo se pueden anular pagos en estodo PENDIENTE. Estado actual: " + pago.getEstadoPago());
        }
        pago.setEstadoPago("ANULADO");
        Pago actualizado = pagoRepository.save(pago);
        return convertirAResponseDTO(actualizado);
    }

    // para obtener pago por estado
    public List<PagoResponseDTO> obtenerPorEstado(String estadoPago) {
        return pagoRepository.findByEstadoPago(estadoPago).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    } 

    private PagoResponseDTO convertirAResponseDTO(Pago p) {
        PagoResponseDTO dto = new PagoResponseDTO();
        dto.setIdPago(p.getIdPago());
        dto.setIdCita(p.getCita().getIdCita());
        dto.setNombrePaciente(p.getCita().getPaciente().getUsuario().getNombre() + " "
                + p.getCita().getPaciente().getUsuario().getApellido());
        dto.setMonto(p.getMonto());
        dto.setMetodoPago(p.getMetodoPago());
        dto.setEstadoPago(p.getEstadoPago());
        dto.setFechaPago(p.getFechaPago());
        dto.setComprobante(p.getComprobante());
        return dto;
    }
    
}
