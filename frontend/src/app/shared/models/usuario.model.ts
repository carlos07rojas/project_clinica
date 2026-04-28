export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: number;
}

export interface UsuarioResponse {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: number;
  activo: boolean;
  fechaCreacion: string;
}
