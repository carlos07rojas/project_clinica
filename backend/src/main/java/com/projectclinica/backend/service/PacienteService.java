package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.PacienteEditarDTO;
import com.projectclinica.backend.dto.PacienteRequestDTO;
import com.projectclinica.backend.dto.PacienteResponseDTO;
import com.projectclinica.backend.model.Paciente;
import com.projectclinica.backend.model.Usuario;
import com.projectclinica.backend.repository.PacienteRepository;
import com.projectclinica.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;

    public PacienteService(PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // crear paciente
    public PacienteResponseDTO crearPaciente(PacienteRequestDTO dto) {
        // no se puede crear un paciente sin un usuario que no tenga email y contraseña
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException(
                "No existe un usuario con esas credenciales: " + dto.getIdUsuario()));

        // se establece el rol a cada usuario
        if (!usuario.getRol().equals("PACIENTE")) {
            throw new RuntimeException(
                    "El usuario no tiene rol PACIENTE");
        }

        // el usuario ya debe de tener un perfil de paciente por eso la relacion de
        // USUARIO-PACIENTe 1 a 1.
        if (pacienteRepository.findByUsuarioId(dto.getIdUsuario()).isPresent()) {
            throw new RuntimeException(
                    "Este usuario ya tiene un perfin de paciente");
        }

        // se estable dni unico y solo de 8 digitos
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException(
                    "Ya existe un paciente con el DNI: " + dto.getDni());
        }
        // verificar que se ingrese solo 8 digitos en el DNI
        if (!dto.getDni().matches("\\d{8}")) {
            throw new RuntimeException(
                    "El DNI debe tener 8 digitos");
        }

        // validacion del sexo
        String sexo = dto.getSexo().toUpperCase();
        if (!sexo.equals("M") && !sexo.equals("F") && !sexo.equals("O")) {
            throw new RuntimeException(
                    "Sexo invalido. Debe ser M, F u O");
        }

        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario);
        paciente.setDni(dto.getDni());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setTelefono(dto.getTelefono());
        paciente.setDireccion(dto.getDireccion());
        paciente.setSexo(dto.getSexo());

        Paciente guardado = pacienteRepository.save(paciente);
        return convertirAResponseDTO(guardado);
    }

    // Obtener paciente
    public List<PacienteResponseDTO> obtenerTodos() {
        return pacienteRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }

    // Obtener paciente por ID
    public PacienteResponseDTO ObtenerPorId(Integer id) {
        Paciente paciente = pacienteRepository.findById(id).orElseThrow(() -> new RuntimeException(
                "Paciente no encontrado"));
        return convertirAResponseDTO(paciente);
    }

    // Obtener paciente por DNI
    public PacienteResponseDTO obtenerPorDni(String dni) {
        Paciente paciente = pacienteRepository.findByDni(dni).orElseThrow(() -> new RuntimeException(
                "Paciente no encontrado con DNI"));
        return convertirAResponseDTO(paciente);
    }

    // editar paciente
    public PacienteResponseDTO editarPaciente(Integer id, PacienteEditarDTO dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));

        // solo se actualizaran campos editables
        if (dto.getTelefono() != null) {
            paciente.setTelefono(dto.getTelefono());
        }
        if (dto.getDirecion() != null) {
            paciente.setDireccion(dto.getDirecion());
        }

        return convertirAResponseDTO(pacienteRepository.save(paciente));
    }

    private PacienteResponseDTO convertirAResponseDTO(Paciente p) {
        PacienteResponseDTO dto = new PacienteResponseDTO();
        dto.setIdPaciente(p.getIdPaciente());
        dto.setDni(p.getDni());
        dto.setFechaNacimiento(p.getFechaNacimiento());
        dto.setTelefono(p.getTelefono());
        dto.setDireccion(p.getDireccion());
        dto.setSexo(p.getSexo());
        // se incluye nombre y email del usuario para mostrar en el frontend sin hacer
        // otra consulta
        dto.setNombre(p.getUsuario().getNombre());
        dto.setApellido(p.getUsuario().getApellido());
        dto.setEmail(p.getUsuario().getEmail());
        return dto;
    }
}
