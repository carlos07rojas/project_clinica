package com.projectclinica.backend.service;

import com.projectclinica.backend.dto.UsuarioRequestDTO;
import com.projectclinica.backend.dto.UsuarioResponseDTO;
import com.projectclinica.backend.model.Usuario;
import com.projectclinica.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;


@Service
public class UsuarioService {
    
    // el Service necesita el Repository para acceder a la BD
    private final UsuarioRepository usuarioRepository;

     // constructor — Spring Boot usa esto para inyectar el Repository
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    // crear un usuario
    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto) {

        // verificador para que no se repita el mismo email
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese Email" + dto.getEmail());
        }

        // se debe validar los unicos usuarios del sistema
        String rol = dto.getRol().toUpperCase();
        if (!rol.equals("ADMIN") &&
                !rol.equals("MEDICO") &&
                !rol.equals("PACIENTE")) {
            throw new RuntimeException(
                    "Rol invalido. Debe ser ADMIN, MEDICO o PACIENTE");
        }

        // la contraseña nunca debe estar guardar en texto plano
        String paswordHasheado = "HASH:" + dto.getPassword();

        // construir el objeto Usuario con los datos validados
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setEmail(dto.getEmail().toLowerCase()); // guardamos el email en minúsculas para evitar duplicados
        usuario.setPasswordHash(paswordHasheado);
        usuario.setRol(rol);

        // se guarda el usuario
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        return convertirAResponseDTO(usuarioGuardado);
    }
    
    // obtener todos los usuarios
    public List<UsuarioResponseDTO> obtenerTodos() {
        // traemos todos los usuarios de la BD  y los convertimos a DTO antes de devolverlos
        // stream() nos permite procesar la lista elemento por elemento
        // map() aplica la conversión a cada elemento
        // collect() junta todo en una lista nueva
        return usuarioRepository.findAll().stream().map(this::convertirAResponseDTO).collect(Collectors.toList());
    }
    
    // obtener usuario por id
    public UsuarioResponseDTO obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario" + id + "no encontrado"));
        return convertirAResponseDTO(usuario);
    }

    // se desactiva el usuario (borrado logico) | solo se desactiva para no romper ninguna relacion que tiene con otras tablas de modo que va a seeguir existiendo pero no podra tener acceso al sistema
    public UsuarioResponseDTO desactivarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        //  verificar si el usuario esta desactivado
        if (!usuario.getActivo()) {
            throw new RuntimeException("El usuario esta desactivado");
        }
        usuario.setActivo(false);
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return convertirAResponseDTO(usuarioActualizado);
    }

    // convertir Model a DTO | este método es privado porque solo lo usa este Service
    private UsuarioResponseDTO convertirAResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();

        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        dto.setActivo(usuario.getActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());

        return dto;
    }
}
