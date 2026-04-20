package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.HistorialClinicoRequestDTO;
import com.projectclinica.backend.dto.HistorialClinicoResponseDTO;
import com.projectclinica.backend.model.Cita;
import com.projectclinica.backend.model.HistorialClinico;
import com.projectclinica.backend.repository.CitaRepository;
import com.projectclinica.backend.repository.HistorialClinicoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistorialClinicoService {
    private final HistorialClinicoRepository historialClinicoRepository;
    private final CitaRepository citaRepository;

    public HistorialClinicoService(HistorialClinicoRepository historialClinicoRepository,
            CitaRepository citaRepository) {
        this.historialClinicoRepository = historialClinicoRepository;
        this.citaRepository = citaRepository;
    }

    // crear hisptorial
    public HistorialClinicoResponseDTO crearHistorial(HistorialClinicoRequestDTO dto) {
        // para crear el historial la cita debe existir
        Cita cita = citaRepository.findById(dto.getIdCita()).orElseThrow(() -> new RuntimeException(
                "Cita " + dto.getIdCita() + " no encontrada"));

        // para crear el historial la cita debe estar COMPLETADA
        if (!cita.getEstado().equals("COMPLETADA")) {
            throw new RuntimeException(
                    "Solo se puede crear un historial de citas COMPLETADAS. Estado Actual: " + cita.getEstado());
        }

        // no puede existir un historial para esa cita. Cada cita genera solo un historial medico
        if (historialClinicoRepository.findByCitaId(dto.getIdCita()).isPresent()) {
            throw new RuntimeException(
                    "Esta cita ya tiene un historial registrado");
        }

        //  el diagnostico dentro del historial es obligatorio
        if (dto.getDiagnostico() == null || dto.getDiagnostico().isBlank()) {
            throw new RuntimeException(
                    "El diagnostico es obligatorio");
        }

        HistorialClinico historial = new HistorialClinico();
        historial.setCita(cita);
        historial.setDiagnostico(dto.getDiagnostico());
        historial.setTratamiento(dto.getTratamiento());
        historial.setNotas(dto.getNotas());

        HistorialClinico guardado = historialClinicoRepository.save(historial);
        return convertirAResponseDTO(guardado);
    }

    // obtener el historial completo de un Paciente
    public List<HistorialClinicoResponseDTO> obtenerPorPaciente(Integer idPaciente) {
        // devuelve todas las consultas que tuvo el paciente con sus diagnósticos y tratamientos
        return historialClinicoRepository.findHistorialPorPaciente(idPaciente).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    } 
    
    private HistorialClinicoResponseDTO convertirAResponseDTO(HistorialClinico h) {
        HistorialClinicoResponseDTO dto = new HistorialClinicoResponseDTO();
        dto.setIdHistorial(h.getIdHistorial());
        dto.setIdCita(h.getIdHistorial());
        dto.setFrechaCita(h.getCita().getFechaHora());
        dto.setNombrePaciente(h.getCita().getPaciente().getUsuario().getNombre() + " "
                + h.getCita().getPaciente().getUsuario().getApellido());
        dto.setNombreMedico(h.getCita().getMedico().getUsuario().getNombre() + " "
                + h.getCita().getMedico().getUsuario().getApellido());
        dto.setNombreServicio(h.getCita().getServicio().getNombre());
        dto.setDiagnostico(h.getDiagnostico());
        dto.setTratamiento(h.getTratamiento());
        dto.setNotas(h.getNotas());
        dto.setFrechaRegistro(h.getFechaRegistro());
        return dto;
    }
}
