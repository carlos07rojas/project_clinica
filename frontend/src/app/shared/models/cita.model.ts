export interface CitaRequest {
  idPaciente: number; // id del paciente que solicita la cita
  idMedico: number; // id del médico con el que se solicita la cita
  idServicio: number; // id del servicio para el que se solicita la cita
  fechaHora: string;
  observaciones?: string;
}

export interface CitaResponse {
  idCita: number;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  idServicio: number;
  nombreServicio: string;
  fechaHora: string;
  duracionMin: number;
  estado: string;
  observacion: string;
  fechaCreacion: string;
}
