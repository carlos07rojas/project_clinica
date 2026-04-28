export interface PagoRequest {
  idCita: number; // id de la cita para la que se realiza el pago
  monto: number;
  metodoPago: string;
}

export interface PagoResponse {
  idPago: number;
  idCita: number;
  nombrePaciente: string;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  fechaPago: string;
  comprobante: string;
}
