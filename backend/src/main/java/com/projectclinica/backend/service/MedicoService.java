package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.MedicoRequestDTO;
import com.projectclinica.backend.dto.MedicoResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.model.Medico;
import com.projectclinica.backend.model.Usuario;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.MedicoRepository;
import com.projectclinica.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicoService {
    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EspecialidadRepository especialidadRepository;

    public MedicoService(MedicoRepository medicoRepository, UsuarioRepository usuarioRepository,
            EspecialidadRepository especialidadRepository) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.especialidadRepository = especialidadRepository;
    }

    // crear medico
    public MedicoResponseDTO crearMedico(MedicoRequestDTO dto) {
        // para esto este usuario debe tener el rol de medico
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException(
                "No existe un usuario con este id: " + dto.getIdUsuario()));
        if (!usuario.getRol().equals("MEDICO")) {
            throw new RuntimeException(
                    "El usuario no tiene rol MEDICO");
        }

        // el usuario no debe tener varios perfiles solo el perfil segun su rol
        if (medicoRepository.findByUsuarioIdUsuario(dto.getIdUsuario()).isPresent()) {
            throw new RuntimeException(
                    "Este usuario ya tiene perfil de medico");
        }

        // codigo de colegiatura unico
        if (medicoRepository.existsByCodigoColegiatura(dto.getCodigoColegiatura())) {
            throw new RuntimeException(
                    "Ya existe  un Medico con el codigo: " + dto.getCodigoColegiatura());
        }

        //  verificar que una especialidad debe esxister y estar activa
        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new RuntimeException(
                        "No existe la especialidad con id: " + dto.getIdEspecialidad()));
        if (!especialidad.getActivo()) {
            throw new RuntimeException(
                    "La especialidad esta desactivada");
        }

        Medico medico = new Medico();
        medico.setUsuario(usuario);
        medico.setCodigoColegiatura(dto.getCodigoColegiatura());
        medico.setEspecialidad(especialidad);
        medico.setTelefono(dto.getTelefono());

        Medico guardad = medicoRepository.save(medico);
        return convertirAResponseDTO(guardad);
    }
    
    // Obtener medico
    public List<MedicoResponseDTO> obtenerTodos() {
        return medicoRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }
    
    // Obtener medico por especialidad
    public List<MedicoResponseDTO> obtenerPorEspecialidad(Integer idEspecialidad) {
        return medicoRepository.findByEspecialidadId(idEspecialidad).stream().map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    private MedicoResponseDTO convertirAResponseDTO(Medico m) {
        MedicoResponseDTO dto = new MedicoResponseDTO();
        dto.setIdMedico(m.getIdMedico());
        dto.setNombre(m.getUsuario().getNombre());
        dto.setApellido(m.getUsuario().getApellido());
        dto.setEmail(m.getUsuario().getEmail());
        dto.setCodigoColegiatura(m.getCodigoColegiatura());
        dto.setTelefono(m.getTelefono());
        // se incluye el nombre de la especialidad directamente para que el frontend no tenga que hacer otra consulta
        dto.setIdEspecialidad(m.getEspecialidad().getIdEspecialidad());
        dto.setNombre(m.getEspecialidad().getNombre());
        return dto;
    }
}
