package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.PacienteEditarDTO;
import com.projectclinica.backend.dto.PacienteRequestDTO;
import com.projectclinica.backend.dto.PacienteResponseDTO;
import com.projectclinica.backend.service.PacienteService;
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
@RequestMapping("/api/pacientes")
public class PacienteController {
    private final PacienteService pacienteService;

    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @PostMapping
    public ResponseEntity<PacienteResponseDTO> crear(@RequestBody PacienteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteService.crearPaciente(dto));
    }

    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(pacienteService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pacienteService.ObtenerPorId(id));
    }

    // GET /api/pacientes/buscar?dni=12345678
    @GetMapping("/buscar")
    public ResponseEntity<PacienteResponseDTO> buscarPorDni(@RequestParam String dni) { // @RequestParam extrae parámetros de la URL después del ? útil para extraer datos solo con el DNI
        return ResponseEntity.ok(pacienteService.obtenerPorDni(dni));
    }

    @PatchMapping("/{id}/editar")
    public ResponseEntity<PacienteResponseDTO> editar(@PathVariable Integer id, @RequestBody PacienteEditarDTO dto) {
        return ResponseEntity.ok(pacienteService.editarPaciente(id, dto));
    }
}
