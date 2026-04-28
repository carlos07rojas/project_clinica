export interface MedicoRequest {
  idUsuario: number; // id del usuario asociado al médico
  codigoColegiatura: string;
  idEspecialidad: number; // id de la especialidad del médico
  telefono?: string;
}

export interface MedicoResponse {
  idMedico: number;
  nombre: string;
  apellido: string;
  email: string;
  codigoColegiatura: string;
  telefono: string;
  idEspecialidad: number;
  nombreEspecialidad: string;
}
