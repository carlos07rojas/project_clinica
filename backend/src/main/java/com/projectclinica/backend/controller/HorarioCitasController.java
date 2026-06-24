package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.HorarioCitasRequestDTO;
import com.projectclinica.backend.dto.HorarioCitasResponseDTO;
import com.projectclinica.backend.service.HorarioCitasService;
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
@RequestMapping("/api/horarios")
public class HorarioCitasController {
    private final HorarioCitasService horarioCitasService;

    public HorarioCitasController(HorarioCitasService horarioCitasService) {
        this.horarioCitasService = horarioCitasService;
    }

    @PostMapping
    public ResponseEntity<HorarioCitasResponseDTO> crear(@RequestBody HorarioCitasRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioCitasService.crearHorario(dto));
    }

    // para poder ver todos los horarios de un médico específico
    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<HorarioCitasResponseDTO>> obtenerPorMedico(@PathVariable Integer idMedico) {
        return ResponseEntity.ok(horarioCitasService.ObtenerPorMedico(idMedico));
    }

    // para traer todos los horarios vigentes y activos
    @GetMapping
    public ResponseEntity<List<HorarioCitasResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(horarioCitasService.obtenerTodos());
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<HorarioCitasResponseDTO> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(horarioCitasService.desactivarHorario(id));
    }
}
