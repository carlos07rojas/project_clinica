// Los modelos son interfaces que representan la forma de los datos como los DTOs en Java

// especialidad.model.ts representa a EspecialidadRequestDTO de Java | son datos que se va a enviar al backend
export interface EspecialidadRequest {
  nombre: string;
  descripcion?: string; // ? significa que es opcional
}

// esto representa a EspecialidadResponseDTO de Java | son datos que se va a recibir del backend
export interface EspecialidadResponse {
  idEspecialidad: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
