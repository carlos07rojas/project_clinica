package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.HorarioCitasRequestDTO;
import com.projectclinica.backend.dto.HorarioCitasResponseDTO;
import com.projectclinica.backend.model.HorarioCitas;
import com.projectclinica.backend.model.Medico;
import com.projectclinica.backend.repository.HorarioCitasRepository;
import com.projectclinica.backend.repository.MedicoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HorarioCitasService {
    private final HorarioCitasRepository horarioCitasRepository;
    private final MedicoRepository medicoRepository;

    public HorarioCitasService(HorarioCitasRepository horarioCitasRepository,
            MedicoRepository medicoRepository) {
        this.horarioCitasRepository = horarioCitasRepository;
        this.medicoRepository = medicoRepository;
    }

    // Crear usuario
    public HorarioCitasResponseDTO crearHorario(HorarioCitasRequestDTO dto) {
        // verificar que el medico exista
        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new RuntimeException("No existe el Medico con id: " + dto.getIdMedico()));

        // verificar los dias de semana que va a ver atencion
        if (dto.getDiaSemana() < 1 || dto.getDiaSemana() > 7) {
            throw new RuntimeException(
                    "Día de semana inválido. Debe ser entre 1 (Lunes) y 7 (Sabado)");
        }

        // verificar la hora de inicio o el horario para evitar datos inconsistentes
        if (!dto.getHoraFin().isAfter(dto.getHoraInicio())) {
            throw new RuntimeException(
                    "La hora de Fin debe ser mayor a la hora de inicio");
        }

        // la fecha de inicio no puede ser en el pasado
        if (dto.getFechaInicio().isBefore(LocalDate.now())) {
            throw new RuntimeException(
                    "La fecha de inicio no puede ser en el pasado");
        }

        // la fecha debe corresponder al día de semana seleccionado
        if (dto.getFechaInicio().getDayOfWeek().getValue() != dto.getDiaSemana()) {
            throw new RuntimeException(
                    "La fecha seleccionada no corresponde al día de semana indicado");
        }

        // verificar que no exista un horario activo para un medico en el mismo dia
        LocalDate fechaFinCalculada = dto.getFechaInicio()
                .with(java.time.DayOfWeek.SUNDAY);

        List<HorarioCitas> horariosSolapados = horarioCitasRepository
                .findHorariosSolapados(
                        dto.getIdMedico(),
                        dto.getDiaSemana(),
                        dto.getFechaInicio(),
                        fechaFinCalculada);

        if (!horariosSolapados.isEmpty()) {
            throw new RuntimeException(
                    "El médico ya tiene un horario registrado ese día para esa semana");
        }

        HorarioCitas horario = new HorarioCitas();
        horario.setMedico(medico);
        horario.setDiaSemana(dto.getDiaSemana());
        horario.setHoraInicio(dto.getHoraInicio());
        horario.setHorarioFin(dto.getHoraFin());
        horario.setFechaInicio(dto.getFechaInicio());
        horario.setFechaFin((fechaFinCalculada));

        HorarioCitas guardado = horarioCitasRepository.save(horario);
        return convertirAResponseDTO(guardado);
    }

    // Obtener horario del medico
    public List<HorarioCitasResponseDTO> ObtenerPorMedico(Integer idMedico) {
        return horarioCitasRepository.findByMedicoId(idMedico).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    // Desactivar horario | borrado logico
    public HorarioCitasResponseDTO desactivarHorario(Integer id) {
        HorarioCitas horario = horarioCitasRepository.findById(id).orElseThrow(() -> new RuntimeException(
                "Horario no encontrado con id: " + id));
        if (!horario.getActivo()) {
            throw new RuntimeException(
                    "El horario ya esta desactivado");
        }

        horario.setActivo(false);
        HorarioCitas actualizado = horarioCitasRepository.save(horario);
        return convertirAResponseDTO(actualizado);
    }

    private HorarioCitasResponseDTO convertirAResponseDTO(HorarioCitas h) {
        HorarioCitasResponseDTO dto = new HorarioCitasResponseDTO();
        dto.setIdHorario(h.getIdHorario());
        dto.setIdMedico(h.getMedico().getIdMedico());
        dto.setNombreMedico(h.getMedico().getUsuario().getNombre() + " " + h.getMedico().getUsuario().getApellido());
        dto.setDiaSemana(h.getDiaSemana());
        dto.setHoraInicio(h.getHoraInicio());
        dto.setHoraFin(h.getHorarioFin());
        dto.setFechaInicio(h.getFechaInicio());
        dto.setFechaFin(h.getFechaFin());
        dto.setActivo(h.getActivo());
        return dto;
    }
}
