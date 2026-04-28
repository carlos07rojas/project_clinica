export interface PacienteRequest {
  idUsuario: number; // id del usuario asociado al paciente
  dni: string;
  fechaNacimiento: string;
  telefono?: string;
  direccion?: string;
  sexo: string;
}

export interface PacienteResponse {
  idPaciente: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  sexo: string;
}
