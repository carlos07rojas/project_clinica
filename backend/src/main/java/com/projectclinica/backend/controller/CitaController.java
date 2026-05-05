package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.CitaRequestDTO;
import com.projectclinica.backend.dto.CitaResponseDTO;
import com.projectclinica.backend.service.CitaService;
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
@RequestMapping("/api/citas")
public class CitaController {
    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    // para agendar una cita nueva
    @PostMapping
    public ResponseEntity<CitaResponseDTO> agendar(@RequestBody CitaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.agendarCita(dto));
    }

    // para poder ver todas las citas de un paciente
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<CitaResponseDTO>> obtenerPorPaciente(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(citaService.obtenerPorPaciente(idPaciente));
    }

    // ver todas la citas de un medico
    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<CitaResponseDTO>> obtenerPorMedico(@PathVariable Integer idMedico) {
        return ResponseEntity.ok(citaService.obtenerPorMedico(idMedico));
    }

    // para confirmar las citas
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<CitaResponseDTO> confirmar(@PathVariable Integer id) {
        return ResponseEntity.ok(citaService.confirmarCita(id));
    }

    // para poder cancelar una cita
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<CitaResponseDTO> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(citaService.cancelarCita(id));
    }

    // opcionalmente se pueden enviar observaciones finales
    @PatchMapping("/{id}/completar")
    public ResponseEntity<CitaResponseDTO> completar(@PathVariable Integer id,
            @RequestParam(required = false) String observaciones) { // @RequestParam es opcional — puede venir o no
        return ResponseEntity.ok(citaService.completarCita(id, observaciones));
    }

    // es para obtener citas filtradas por estado
    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> obtenerPorEstado(@RequestParam String estado) {
        return ResponseEntity.ok(citaService.obtenerPorEstado(estado));
    }
}
