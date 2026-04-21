package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.ServicioRequestDTO;
import com.projectclinica.backend.dto.ServicioResponseDTO;
import com.projectclinica.backend.service.ServicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/servicio")
public class ServicioController {
    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @PostMapping
    public ResponseEntity<ServicioResponseDTO> crear(@RequestBody ServicioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicioService.crearServicio(dto));
    }

    // cuando el paciente elige especialidad y médico el frontend carga los servicios disponibles
    @GetMapping("/por-especialidad")
    public ResponseEntity<List<ServicioResponseDTO>> obtenerPorEspecialidad(@RequestParam Integer idEspecialidad) {
        return ResponseEntity.ok(servicioService.obtenerPorEspecialidad(idEspecialidad));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ServicioResponseDTO> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(servicioService.desactivarServicio(id));
    }
}
