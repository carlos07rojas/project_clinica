package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.EspecialidadRequestDTO;
import com.projectclinica.backend.dto.EspecialidadResponseDTO;
import com.projectclinica.backend.service.EspecialidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {
    private final EspecialidadService especialidadService;

    public EspecialidadController(EspecialidadService especialidadService) {
        this.especialidadService = especialidadService;
    }
    
    // @PostMapping, lo que el POST hara es enviar algo nuevo al cuerpo principal | crea una especualidad nueva
    @PostMapping
    public ResponseEntity<EspecialidadResponseDTO> crear(@RequestBody EspecialidadRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(especialidadService.crearEspecialidad(dto));
    }
    
    // solo se va a mostrar las especialidades activas | GET /api/especialidades/activas
    @GetMapping("/activas")
    public ResponseEntity<List<EspecialidadResponseDTO>> obtenerActivas() {
        return ResponseEntity.ok(especialidadService.obtenerActivas());
    }

    // solo en el panel admin se mostraran todas las especialides, acticas o no | GET /api/especialidades
    @GetMapping
    public ResponseEntity<List<EspecialidadResponseDTO>> obtenerTodas() {
        return ResponseEntity.ok(especialidadService.obtenerTodas());
    }

    // para poder eliminar o un borrado logico al usuario
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<EspecialidadResponseDTO> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(especialidadService.desactivarEspecialidad(id));
    }
}
