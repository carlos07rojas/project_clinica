package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.EspecialidadResponseDTO;
import com.projectclinica.backend.dto.MedicoEditarDTO;
import com.projectclinica.backend.dto.MedicoRequestDTO;
import com.projectclinica.backend.dto.MedicoResponseDTO;
import com.projectclinica.backend.model.Especialidad;
import com.projectclinica.backend.model.Medico;
import com.projectclinica.backend.model.MedicoEspecialidad;
import com.projectclinica.backend.model.Usuario;
import com.projectclinica.backend.repository.EspecialidadRepository;
import com.projectclinica.backend.repository.MedicoRepository;
import com.projectclinica.backend.repository.UsuarioRepository;
import com.projectclinica.backend.repository.MedicoEspecialidadRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicoService {
    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicoEspecialidadRepository medicoEspecialidadRepository;
    private final EspecialidadRepository especialidadRepository;

    public MedicoService(MedicoRepository medicoRepository, UsuarioRepository usuarioRepository,
            MedicoEspecialidadRepository medicoEspecialidadRepository,
            EspecialidadRepository especialidadRepository) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicoEspecialidadRepository = medicoEspecialidadRepository;
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
                    "Ya exio con el cste  un Medicodigo: " + dto.getCodigoColegiatura());
        }

        // verificar que una especialidad debe esxister y estar activa
        // Especialidad especialidad =
        // especialidadRepository.findById(dto.getIdEspecialidades())
        // .orElseThrow(() -> new RuntimeException(
        // "No existe la especialidad con id: " + dto.getIdEspecialidad()));
        // if (!especialidad.getActivo()) {
        // throw new RuntimeException(
        // "La especialidad esta desactivada");
        // }

        Medico medico = new Medico();
        medico.setUsuario(usuario);
        medico.setCodigoColegiatura(dto.getCodigoColegiatura());
        medico.setTelefono(dto.getTelefono());

        Medico guardado = medicoRepository.save(medico);

        // logs temporales
        System.out.println("DTO completo: " + dto);
        System.out.println("idEspecialidades: " + dto.getIdEspecialidades());
        System.out.println("Es null: " + (dto.getIdEspecialidades() == null));
        System.out
                .println("Tamaño: " + (dto.getIdEspecialidades() != null ? dto.getIdEspecialidades().size() : "null"));

        // con esto se asginara especialidades desde la lista
        if (dto.getIdEspecialidades() != null && !dto.getIdEspecialidades().isEmpty()) {
            for (Integer idEsp : dto.getIdEspecialidades()) {
                System.out.println("Procesando especialidad id: " + idEsp);
                Especialidad esp = especialidadRepository.findById(idEsp)
                        .orElseThrow(() -> new RuntimeException("Especialidad no encontrada" + idEsp));
                MedicoEspecialidad me = new MedicoEspecialidad();
                me.setMedico(guardado);
                me.setEspecialidad(esp);
                medicoEspecialidadRepository.save(me);
                System.out.println("guardada especialidad: " + esp.getNombre());
            }
        } else {
            System.out.println("Lista nula o vacia" + dto.getIdEspecialidades());
        }

        return convertirAResponseDTO(guardado);
    }

    // editar telefono del medico
    public MedicoResponseDTO editarMedico(Integer id, MedicoEditarDTO dto) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medico no encontrado con id: " + id));
        // para editar el telefono del usuario
        if (dto.getTelefono() != null) {
            medico.setTelefono(dto.getTelefono());
        }

        // editar el gmail del medico
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (usuarioRepository.existsByEmailAndIdUsuarioNot(dto.getEmail(), medico.getUsuario().getIdUsuario())) {
                throw new RuntimeException(
                        "El Gmail ya esta en uso por otro usuario");
            }
            medico.getUsuario().setEmail(dto.getEmail());
            usuarioRepository.save(medico.getUsuario());
        }

        return convertirAResponseDTO(medicoRepository.save(medico));
    }

    // Obtener medico
    public List<MedicoResponseDTO> obtenerTodos() {
        return medicoRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }

    private MedicoResponseDTO convertirAResponseDTO(Medico m) {
        MedicoResponseDTO dto = new MedicoResponseDTO();
        dto.setIdMedico(m.getIdMedico());
        dto.setNombre(m.getUsuario().getNombre());
        dto.setApellido(m.getUsuario().getApellido());
        dto.setEmail(m.getUsuario().getEmail());
        dto.setCodigoColegiatura(m.getCodigoColegiatura());
        dto.setTelefono(m.getTelefono());

        // Obtener especialidades activas de la tabla intermedia
        List<EspecialidadResponseDTO> especialidades = medicoEspecialidadRepository.findActivasByMedico(m.getIdMedico())
                .stream().map(me -> {
                    EspecialidadResponseDTO esp = new EspecialidadResponseDTO();
                    esp.setIdEspecialidad(me.getEspecialidad().getIdEspecialidad());
                    esp.setNombre(me.getEspecialidad().getNombre());
                    esp.setActivo(me.getEspecialidad().getActivo());
                    return esp;
                }).collect(Collectors.toList());
        dto.setEspecialidades(especialidades);
        return dto;
    }
}
