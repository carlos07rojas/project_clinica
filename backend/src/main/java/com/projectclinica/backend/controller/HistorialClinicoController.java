package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.HistorialClinicoEditarDTO;
import com.projectclinica.backend.dto.HistorialClinicoRequestDTO;
import com.projectclinica.backend.dto.HistorialClinicoResponseDTO;
import com.projectclinica.backend.service.HistorialClinicoService;
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
@RequestMapping("/api/historial")
public class HistorialClinicoController {
    public final HistorialClinicoService historialClinicoService;

    public HistorialClinicoController(HistorialClinicoService historialClinicoService) {
        this.historialClinicoService = historialClinicoService;
    }

    // el médico podra registrar el historial del paciente después de completar la
    // cita
    @PostMapping
    public ResponseEntity<HistorialClinicoResponseDTO> crear(@RequestBody HistorialClinicoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(historialClinicoService.crearHistorial(dto));
    }

    // el médico podra ver todo el historial clínico de un paciente
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<HistorialClinicoResponseDTO>> obtenerPorPaciente(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(historialClinicoService.obtenerPorPaciente(idPaciente));
    }

    @PatchMapping("/{id}/editar")
    public ResponseEntity<HistorialClinicoResponseDTO> editar(@PathVariable Integer id,
            @RequestBody HistorialClinicoEditarDTO dto) {
        return ResponseEntity.ok(historialClinicoService.editarHistorial(id, dto));
    }
}
