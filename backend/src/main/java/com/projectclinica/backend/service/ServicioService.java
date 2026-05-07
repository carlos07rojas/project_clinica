package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.ServicioRequestDTO;
import com.projectclinica.backend.dto.ServicioResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.model.Servicio;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioService {
    private final ServicioRepository servicioRepository;
    private final EspecialidadRepository especialidadRepository;

    public ServicioService(ServicioRepository servicioRepository,
            EspecialidadRepository especialidadRepository) {
        this.servicioRepository = servicioRepository;
        this.especialidadRepository = especialidadRepository;
    }

    // Crear servicio
    public ServicioResponseDTO crearServicio(ServicioRequestDTO dto) {
        // la especialidad debe existir y estar activa
        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new RuntimeException(
                        "No existe la especialidad con id: " + dto.getIdEspecialidad()));
        if (!especialidad.getActivo()) {
            throw new RuntimeException(
                    "La especialidad esta desactivada");
        }
        // el precio de los servicio se debe estrablecer > 0
        if (dto.getPrecio().doubleValue() <= 0) {
            throw new RuntimeException(
                    "El precio debe ser mayor a 0");
        }
        // las duraciones de los servicios deben ser > 0
        if (dto.getDuracionMin() <= 0) {
            throw new RuntimeException(
                    "La duracion del servicio dene ser mayor a 0");
        }

        Servicio servicio = new Servicio();
        servicio.setNombre(dto.getNombre());
        servicio.setDescripcion(dto.getDescripcion());
        servicio.setPrecio(dto.getPrecio());
        servicio.setDuracionMin(dto.getDuracionMin());
        servicio.setEspecialidad(especialidad);

        Servicio guardado = servicioRepository.save(servicio);
        return convertirAResponseDTO(guardado);
    }

    // obtener servicios activos por especialidad
    public List<ServicioResponseDTO> obtenerPorEspecialidad(Integer idEspecialidad) {
        // esto hara que cuando se seleccion las especialidades solo se muestren los
        // activos
        return servicioRepository.findActivosPorEspecialidad(idEspecialidad).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    // desactivar servicio | borrado logico
    public ServicioResponseDTO desactivarServicio(Integer id) {
        Servicio servicio = servicioRepository.findById(id).orElseThrow(() -> new RuntimeException(
                "Servicio no encontrado con id: " + id));
        if (!servicio.getActivo()) {
            throw new RuntimeException(
                    "El servicio ya esta activo");
        }

        servicio.setActivo(false);
        Servicio actualizado = servicioRepository.save(servicio);
        return convertirAResponseDTO(actualizado);
    }

    public List<ServicioResponseDTO> obtenerTodos() {
        return servicioRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }

    private ServicioResponseDTO convertirAResponseDTO(Servicio s) {
        ServicioResponseDTO dto = new ServicioResponseDTO();
        dto.setIdServicio(s.getIdServicio());
        dto.setNombre(s.getNombre());
        dto.setDescripcion(s.getDescripcion());
        dto.setPrecio(s.getPrecio());
        dto.setDuracionMin(s.getDuracionMin());
        dto.setIdEspecialidad(s.getEspecialidad().getIdEspecialidad());
        dto.setNombreEspecialidad(s.getEspecialidad().getNombre());
        dto.setActivo(s.getActivo());
        return dto;
    }

}
