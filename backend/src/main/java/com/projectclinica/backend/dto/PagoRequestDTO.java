package com.projectclinica.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PagoRequestDTO {
    private Integer idCita;
    private BigDecimal monto;
    private String metodoPago;
}
