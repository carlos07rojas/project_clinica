package com.projectclinica.backend.controller;

import com.projectclinica.backend.dto.PagoRequestDTO;
import com.projectclinica.backend.dto.PagoResponseDTO;
import com.projectclinica.backend.service.PagoService;
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
@RequestMapping("/api/pagos")
public class PagoController {
    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }
    // registrar un pago para una cita
    @PostMapping
    public ResponseEntity<PagoResponseDTO> registrar(@RequestBody PagoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrarPago(dto));
    }

    // ver pagos filtrados por estado
    @GetMapping
    public ResponseEntity<List<PagoResponseDTO>> obtenerPorEstado(@RequestParam String estadoPago) {
        return ResponseEntity.ok(pagoService.obtenerPorEstado(estadoPago));
    }

    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<PagoResponseDTO> confirmar(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoService.confirmarPago(id));
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<PagoResponseDTO> anular(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoService.anularPago(id));
    }
}
