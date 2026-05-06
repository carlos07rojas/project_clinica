package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.MedicoRequestDTO;
import com.projectclinica.backend.dto.MedicoResponseDTO;
import com.projectclinica.backend.service.MedicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {
    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> crear(@RequestBody MedicoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.crearMedico(dto));
    }

    @GetMapping
    public ResponseEntity<List<MedicoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(medicoService.obtenerTodos());
    }

    // este endpoint servira para cargar los medicos 
    @GetMapping("/por-especialidad")
    public ResponseEntity<List<MedicoResponseDTO>> obtenerPorEspecialidad(@RequestParam Integer idEspecialidad) {
        return ResponseEntity.ok(medicoService.obtenerPorEspecialidad(idEspecialidad));
    }
}
