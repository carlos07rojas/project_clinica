package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.EspecialidadRequestDTO;
import com.projectclinica.backend.dto.EspecialidadResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.MedicoEspecialidadRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;
    private final MedicoEspecialidadRepository medicoEspecialidadRepository;

    public EspecialidadService(EspecialidadRepository especialidadRepository,
            MedicoEspecialidadRepository medicoEspecialidadRepository) {
        this.especialidadRepository = especialidadRepository;
        this.medicoEspecialidadRepository = medicoEspecialidadRepository;
    }

    // CREAR ESPECIALIDAD
    public EspecialidadResponseDTO crearEspecialidad(EspecialidadRequestDTO dto) {
        // esta condicion va a permitir que las especialidades no se repitan
        if (especialidadRepository.existsByNombre(dto.getNombre())) {
            throw new RuntimeException(
                    "Ya existe una especialidad con el nombre: " + dto.getNombre());
        }

        Especialidad especialidad = new Especialidad();
        especialidad.setNombre(dto.getNombre());
        especialidad.setDescripcion(dto.getDescripcion());

        // guardar la especialida
        Especialidad guardada = especialidadRepository.save(especialidad);
        return convertirAResponseDTO(guardada);
    }

    // Obtener especialidades activas - esto solo se mostrara al agendar citas solo
    // las activas

    public List<EspecialidadResponseDTO> obtenerActivas() {
        return especialidadRepository.findByActivoTrue().stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    // obtener todas las especialidad, activas o inactivas para el admin
    public List<EspecialidadResponseDTO> obtenerTodas() {
        return especialidadRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }

    // desactivar especialidad - borrado logico
    public EspecialidadResponseDTO desactivarEspecialidad(Integer id) {
        Especialidad especialidad = especialidadRepository.findById(id).orElseThrow(() -> new RuntimeException(
                "Especilidad no encontrada con id : " + id));

        if (!especialidad.getActivo()) {
            throw new RuntimeException(
                    "La especialidad esta desactivada");
        }
        // con esta regla no se desactivara si hay medicos activos
        long medicosActivos = medicoEspecialidadRepository.contarMedicosActivos(id);
        if (medicosActivos > 0) {
            throw new RuntimeException(
                    "No se puede desactivar. Tiene " + medicosActivos + " medico(s) activo(s) asignado(s)");
        }

        especialidad.setActivo(false);
        return convertirAResponseDTO(especialidadRepository.save(especialidad));
    }

    // convertir Model a DTO | este método es privado porque solo lo usa este
    // Service
    private EspecialidadResponseDTO convertirAResponseDTO(Especialidad e) {
        EspecialidadResponseDTO dto = new EspecialidadResponseDTO();
        dto.setIdEspecialidad(e.getIdEspecialidad());
        dto.setNombre(e.getNombre());
        dto.setDescripcion(e.getDescripcion());
        dto.setActivo(e.getActivo());
        return dto;
    }
}
