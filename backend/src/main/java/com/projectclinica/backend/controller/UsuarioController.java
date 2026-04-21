package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.UsuarioRequestDTO;
import com.projectclinica.backend.dto.UsuarioResponseDTO;
import com.projectclinica.backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;


@RestController // @RestController es una combinacionde @Controller y @ResponseBody, esto maneja peticiones HTTP y cada metodo devuelve datos JSON automaticamente
@RequestMapping("/api/usuarios") // @RquestMapping esto define la ruta de todos los endpoints y todos los endpoints controller empiezan con /api/usuarios
public class UsuarioController {
    private final UsuarioService usuarioService;
    // de esta forma spring inyecta o trae todo lo de Service automaticamente
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // @PostMapping, lo que el POST hara es enviar algo nuevo al cuerpo principal | crea un usuario nuevo
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crearUsuario(@RequestBody UsuarioRequestDTO dto) { // @ResquestBody lee el JSON que recibe de Angular y lo convierte automaticamente en DTO
        UsuarioResponseDTO response = usuarioService.crearUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // ResponseEntity permite controlar el codigo HTTP y muestra el estado del codigo cuando crea algo nuevo 201 CREATED
    }

    // @GetMapping, lo que hara GET es obtener todos los usuarios | GET /api/usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(usuarioService.obtenerTodos()); // .ok() es un atajo para status 200 OK
    }

    // para poder obtener el usuario con su id | GET /api/usuarios/001
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Integer id) { //@PathVariable extrae el id de la URL
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    // para poder eliminar o un borrado logico al usuario | PATCH /api/usuarios/001/desactivar
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<UsuarioResponseDTO> desactivarUsuario(@PathVariable Integer id) {
        // se usa PATCH porque es una atualizacion parcial porque solo se cambia el campo activo, no todo el usuario
        return ResponseEntity.ok(usuarioService.desactivarUsuario(id));
    }
}
