package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.MedicoEspecialidadRequestDTO;
import com.projectclinica.backend.dto.MedicoEspecialidadResponseDTO;
import com.projectclinica.backend.service.MedicoEspecialidadService;
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
@RequestMapping("/api/medico-especialidad")
public class MedicoEspecialidadController {
    private final MedicoEspecialidadService service;

    public MedicoEspecialidadController(MedicoEspecialidadService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MedicoEspecialidadResponseDTO> agregar(
            @RequestBody MedicoEspecialidadRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.agregar(dto));
    }

    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<MedicoEspecialidadResponseDTO>> obtenerPorMedico(@PathVariable Integer idMedico) {
        return ResponseEntity.ok(service.obtenerPorMedico(idMedico));
    }

    @GetMapping("/especialidad/{idEspecialidad}")
    public ResponseEntity<List<MedicoEspecialidadResponseDTO>> obtenerPorEspecialidad(
            @PathVariable Integer idEspecialidad) {
        return ResponseEntity.ok(service.obtenerPorEspecialidad(idEspecialidad));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<MedicoEspecialidadResponseDTO> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.desactivar(id));
    }
}
