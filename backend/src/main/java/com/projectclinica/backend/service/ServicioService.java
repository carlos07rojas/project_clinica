package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.ServicioEditarDTO;
import com.projectclinica.backend.dto.ServicioRequestDTO;
import com.projectclinica.backend.dto.ServicioResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.model.Servicio;
import com.projectclinica.backend.repository.CitaRepository;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.MedicoEspecialidadRepository;
import com.projectclinica.backend.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioService {
    private final ServicioRepository servicioRepository;
    private final CitaRepository citaRepository;
    private final EspecialidadRepository especialidadRepository;
    private final MedicoEspecialidadRepository medicoEspecialidadRepository;

    public ServicioService(ServicioRepository servicioRepository, CitaRepository citaRepository,
            EspecialidadRepository especialidadRepository, MedicoEspecialidadRepository medicoEspecialidadRepository) {
        this.servicioRepository = servicioRepository;
        this.citaRepository = citaRepository;
        this.especialidadRepository = especialidadRepository;
        this.medicoEspecialidadRepository = medicoEspecialidadRepository;
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

        // solo crear servicio si hay medicos activos en esa especialidad
        long medicosActivos = medicoEspecialidadRepository.contarMedicosActivos(dto.getIdEspecialidad());
        if (medicosActivos == 0) {
            throw new RuntimeException("No hay médicos disponibles para esta especialidad");
        }

        // verificar el doplicado
        if (servicioRepository.existsByNombre(dto.getNombre())) {
            throw new RuntimeException("Ya existe un servicio con ese nombre");
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

    public ServicioResponseDTO editarServicio(Integer id, ServicioEditarDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio con id: " + id + " no encontrado"));
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            // para veridica que el nombre no este en uso por otro servicio
            if (servicioRepository.existsByNombreAndIdServicioNot(dto.getNombre(), id)) {
                throw new RuntimeException("Ya existe un servicio con este nombre");
            }
            servicio.setNombre(dto.getNombre());
        }
        if (dto.getDescripcion() != null) {
            servicio.setDescripcion(dto.getDescripcion());
        }
        if (dto.getPrecio() != null) {
            servicio.setPrecio(dto.getPrecio());
        }
        if (dto.getDuracionMin() != null) {
            servicio.setDuracionMin(dto.getDuracionMin());
        }
        return convertirAResponseDTO(servicioRepository.save(servicio));
    }

    public ServicioResponseDTO reactivarServicio(Integer id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        if (servicio.getActivo()) {
            throw new RuntimeException("El servicio ya esta activo");
        }
        // para verificar que la especialidad siga activa
        if (!servicio.getEspecialidad().getActivo()) {
            throw new RuntimeException(
                    "No se puede reactvar, especialidad " + servicio.getEspecialidad().getNombre() + " ya activa");
        }
        // para verificar que haya medicos activos
        long medicosActivos = medicoEspecialidadRepository
                .contarMedicosActivos(servicio.getEspecialidad().getIdEspecialidad());
        if (medicosActivos == 0) {
            throw new RuntimeException(
                    "No hay medicos acticos en la especialidad" + servicio.getEspecialidad().getNombre());
        }
        servicio.setActivo(true);
        return convertirAResponseDTO(servicioRepository.save(servicio));
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
        dto.setTotalCitas(citaRepository.contarPorServicio(s.getIdServicio()));
        dto.setActivo(s.getActivo());
        return dto;
    }

}
