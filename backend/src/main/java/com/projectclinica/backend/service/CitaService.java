package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.CitaRequestDTO;
import com.projectclinica.backend.dto.CitaResponseDTO;
import com.projectclinica.backend.model.Cita;
import com.projectclinica.backend.model.Medico;
import com.projectclinica.backend.model.Paciente;
import com.projectclinica.backend.model.Servicio;
import com.projectclinica.backend.repository.CitaRepository;
import com.projectclinica.backend.repository.HorarioCitasRepository;
import com.projectclinica.backend.repository.MedicoRepository;
import com.projectclinica.backend.repository.PacienteRepository;
import com.projectclinica.backend.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
// import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
// import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Service
public class CitaService {
    private final CitaRepository citaRepository;
    private final HorarioCitasRepository horarioCitasRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final ServicioRepository servicioRepository;

    public CitaService(CitaRepository citaRepository,
            HorarioCitasRepository horarioCitasRepository,
            MedicoRepository medicoRepository,
            PacienteRepository pacienteRepository,
            ServicioRepository servicioRepository) {
        this.citaRepository = citaRepository;
        this.horarioCitasRepository = horarioCitasRepository;
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.servicioRepository = servicioRepository;
    }

    // agrega citas
    public CitaResponseDTO agendarCita(CitaRequestDTO dto) {
        // para esto el paciente debe existir
        Paciente paciente = pacienteRepository.findById(dto.getIdPaciente()).orElseThrow(() -> new RuntimeException(
                "Paciente no encontrado con id: " + dto.getIdPaciente()));

        // para esto el medico debe de existir
        Medico medico = medicoRepository.findById(dto.getIdMedico()).orElseThrow(() -> new RuntimeException(
                "Medico no encontrado con id: " + dto.getIdMedico()));

        // el medico debe estar activo en la clinica
        if (!medico.getUsuario().getActivo()) {
            throw new RuntimeException(
                    "El medico no esta activo");
        }

        // el servicio debe existir y estar activo
        Servicio servicio = servicioRepository.findById(dto.getIdServicio()).orElseThrow(() -> new RuntimeException(
                "El servicio " + dto.getIdServicio() + " no fue encontrado"));
        if (!servicio.getActivo()) {
            throw new RuntimeException(
                    "El servicio no esta activo");
        }

        // el servicio debe pertenecer a una especialidad de un medico
        if (!servicio.getEspecialidad().getIdEspecialidad().equals(medico.getEspecialidad().getIdEspecialidad())) {
            throw new RuntimeException(
                    "El servicio no corresponde al servicio del medico");
        }

        // la cita debe agendarse con 24 horas de anticipacion
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime minimoPermitido = ahora.plusHours(24);
        if (dto.getFechaHora().isBefore(minimoPermitido)) {
            throw new RuntimeException(
                    "La cita debe agendarse con al menos 24 horas de anticipacion");
        }

        LocalDate fechaCita = dto.getFechaHora().toLocalDate();
        int diaSemana = dto.getFechaHora().getDayOfWeek().getValue();
        var horariosDelDia = horarioCitasRepository
                .findHorariosActivosPorMedicoYDia(dto.getIdMedico(), diaSemana);

        if (horariosDelDia.isEmpty()) {
            throw new RuntimeException(
                    "El medico no trabaja ese dia de la semana");
        }

        // buscar el horario vigente para esa semana específica
        var horario = horariosDelDia.stream()
                .filter(h -> !fechaCita.isBefore(h.getFechaInicio()) &&
                        !fechaCita.isAfter(h.getFechaFin()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "No hay horario disponible para esa fecha. " +
                                "Verifica que el médico tenga horario registrado para esa semana"));

        // la hora de la cita debe estar dentro del horario del medico
        var horaCita = dto.getFechaHora().toLocalTime();
        if (horaCita.isBefore(horario.getHoraInicio()) ||
                horaCita.isAfter(horario.getHorarioFin())) {
            throw new RuntimeException(
                    "La hora esta fuera del horario del medico. Trabaja de "
                            + horario.getHoraInicio() + " a " + horario.getHorarioFin());
        }

        // el medico no debe tener otra cita en la misma hora
        if (citaRepository.existeCitaEnHorario(dto.getIdMedico(), dto.getFechaHora())) {
            throw new RuntimeException(
                    "El medico no esta disponible para esa hora");
        }

        // el paciente no debe tener una cita en la misma hora
        List<Cita> citasPaciente = citaRepository.findByPacienteId(dto.getIdPaciente());
        boolean pacienteTieneCitaEsaHora = citasPaciente.stream()
                .anyMatch(c -> c.getFechaHora().equals(dto.getFechaHora()) && !c.getEstado().equals("CANCELADA"));
        if (pacienteTieneCitaEsaHora) {
            throw new RuntimeException(
                    "El paciente ya tiene una cita en ese horario");
        }

        // el paciente no puede tener mas de 3 citas pendientes al mismo tiempo
        long citasPendientes = citasPaciente.stream().filter(c -> c.getEstado().equals("PENDIENTE")).count();
        if (citasPendientes >= 3) {
            throw new RuntimeException(
                    "El paciente ya tiene 3 citas pendientes. Debe confirmar o cancelar alguna antes de agendar otra");
        }

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setServicio(servicio);
        cita.setFechaHora(dto.getFechaHora());
        cita.setDuracionMin(servicio.getDuracionMin());
        // usamos la duración del servicio directamente para que sea consistente con lo
        // que ofrece la clínica
        cita.setObservaciones(dto.getObservaciones());

        Cita guardada = citaRepository.save(cita);
        return convertirAReponseDTO(guardada);

    }

    // poder cancelar una cita
    public CitaResponseDTO cancelarCita(Integer idCita) {
        Cita cita = citaRepository.findById(idCita).orElseThrow(() -> new RuntimeException(
                "Cita " + idCita + " no enconrtrada"));

        // la cita solo se puede encontrar si esta PENDIENDTE o CANCELADA
        if (cita.getEstado().equals("COMPLETADA")) {
            throw new RuntimeException(
                    "No se puede cancelar una cita COMPLETADA");
        }
        if (cita.getEstado().equals("CANCELADA")) {
            throw new RuntimeException("La cita ya esta CANCELADA");
        }

        cita.setEstado("CANCELADA");
        Cita actualizada = citaRepository.save(cita);
        return convertirAReponseDTO(actualizada);
    }

    // poder confirmar una cita
    public CitaResponseDTO confirmarCita(Integer idCita) {
        Cita cita = citaRepository.findById(idCita).orElseThrow(() -> new RuntimeException(
                "Cita " + idCita + " no enconrtrada"));

        // la cita solo se puede confirmar si esta PENDIENTE
        if (!cita.getEstado().equals("PENDIENTE")) {
            throw new RuntimeException(
                    "Solo se puede confirmar Citas en estado PENDIENTE. Estado actual de la cita: " + cita.getEstado());
        }

        cita.setEstado("CONFIRMADA");
        Cita actualizada = citaRepository.save(cita);
        return convertirAReponseDTO(actualizada);
    }

    // poder completar una cita
    public CitaResponseDTO completarCita(Integer idCita, String observaciones) {
        Cita cita = citaRepository.findById(idCita).orElseThrow(() -> new RuntimeException(
                "Cita " + idCita + " no enconrtrada"));
        // la cita solo se puede completar si esta CONFIRMADA
        if (!cita.getEstado().equals("CONFIRMADA")) {
            throw new RuntimeException(
                    "Solo se puede completar citas en estado CONFIRMADA. Estado actual de la cita: "
                            + cita.getEstado());
        }

        cita.setEstado("COMPLETADA");
        if (observaciones != null && !observaciones.isBlank()) {
            cita.setObservaciones(observaciones);
        }

        Cita actualizada = citaRepository.save(cita);
        return convertirAReponseDTO(actualizada);
    }

    // poder obtener citas de un paciente
    public List<CitaResponseDTO> obtenerPorPaciente(Integer idPaciente) {
        return citaRepository.findByPacienteId(idPaciente).stream().map(this::convertirAReponseDTO)
                .collect(Collectors.toList());
    }

    // poder obtener citas de un medico
    public List<CitaResponseDTO> obtenerPorMedico(Integer idMedico) {
        return citaRepository.findByMedicoId(idMedico).stream().map(this::convertirAReponseDTO)
                .collect(Collectors.toList());
    }

    // poder obtener citas por estado
    public List<CitaResponseDTO> obtenerPorEstado(String estado) {
        return citaRepository.findByEstado(estado).stream().map(this::convertirAReponseDTO)
                .collect(Collectors.toList());
    }

    private CitaResponseDTO convertirAReponseDTO(Cita c) {
        CitaResponseDTO dto = new CitaResponseDTO();
        dto.setIdCita(c.getIdCita());
        dto.setIdPaciente(c.getPaciente().getIdPaciente());
        dto.setNombrePaciente(c.getPaciente().getUsuario().getNombre() + " " + c.getPaciente().getUsuario().getApellido());
        dto.setIdMedico(c.getMedico().getIdMedico());
        dto.setNombreMedico(c.getMedico().getUsuario().getNombre() + " " + c.getMedico().getUsuario().getApellido());
        dto.setIdServicio(c.getServicio().getIdServicio());
        dto.setNombreServicio(c.getServicio().getNombre());
        dto.setFechaHora(c.getFechaHora());
        dto.setDuracionMin(c.getDuracionMin());
        dto.setEstado(c.getEstado());
        dto.setObservacion(c.getObservaciones());
        dto.setFechaCreacion(c.getFechaCreacion());
        return dto;
    }

}
