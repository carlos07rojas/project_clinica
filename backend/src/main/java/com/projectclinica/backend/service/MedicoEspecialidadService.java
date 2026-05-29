package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.MedicoEspecialidadRequestDTO;
import com.projectclinica.backend.dto.MedicoEspecialidadResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.model.Medico;
import com.projectclinica.backend.model.MedicoEspecialidad;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.MedicoEspecialidadRepository;
import com.projectclinica.backend.repository.MedicoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicoEspecialidadService {
    private final MedicoEspecialidadRepository medicoEspecialidadRepository;
    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;

    public MedicoEspecialidadService(MedicoEspecialidadRepository medicoEspecialidadRepository,
            MedicoRepository medicoRepository, EspecialidadRepository especialidadRepository) {
        this.medicoEspecialidadRepository = medicoEspecialidadRepository;
        this.medicoRepository = medicoRepository;
        this.especialidadRepository = especialidadRepository;
    }

    public MedicoEspecialidadResponseDTO agregar(MedicoEspecialidadRequestDTO dto) {
        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new RuntimeException("Medico no encontrado"));
        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));

        if (!especialidad.getActivo()) {
            throw new RuntimeException("La especialidad esta desactivada");
        }

        if (medicoEspecialidadRepository.existeRelacionActiva(dto.getIdMedico(), dto.getIdEspecialidad())) {
            throw new RuntimeException("El medico ya tiene esta especialidad asignada");
        }

        MedicoEspecialidad me = new MedicoEspecialidad();
        me.setMedico(medico);
        me.setEspecialidad(especialidad);

        return convertirAResponseDTO(medicoEspecialidadRepository.save(me));
    }

    public List<MedicoEspecialidadResponseDTO> obtenerPorMedico(Integer idMedico) {
        return medicoEspecialidadRepository.findActivasByMedico(idMedico).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MedicoEspecialidadResponseDTO> obtenerPorEspecialidad(Integer idEspecialidad) {
        return medicoEspecialidadRepository.findActivasByEspecialidad(idEspecialidad).stream()
                .map(this::convertirAResponseDTO).collect(Collectors.toList());
    }

    public MedicoEspecialidadResponseDTO desactivar(Integer id) {
        MedicoEspecialidad me = medicoEspecialidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relacion no encontrada"));
        return convertirAResponseDTO(medicoEspecialidadRepository.save(me));
    }

    private MedicoEspecialidadResponseDTO convertirAResponseDTO(MedicoEspecialidad me) {
        MedicoEspecialidadResponseDTO dto = new MedicoEspecialidadResponseDTO();
        dto.setId(me.getId());
        dto.setIdMedico(me.getMedico().getIdMedico());
        dto.setNombreMedico(me.getMedico().getUsuario().getNombre() + " " + me.getMedico().getUsuario().getApellido());
        dto.setIdEspecialidad(me.getEspecialidad().getIdEspecialidad());
        dto.setNombreEspecialidad(me.getEspecialidad().getNombre());
        dto.setActivo(me.getActivo());
        return dto;
    }
}
