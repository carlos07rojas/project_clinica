import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// interfaz para los servicios medicos
export interface ServicioResponse {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  idEspecialidad: number;
  nombreEspecialidad: string;
  activo: boolean;
}

export interface ServicioRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  idEspecialidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class ServicioService {
  private url = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(this.url);
  }

  // obtener servicios activos de una especialidad se usa en el modal de citas cuando el usuario selecciona una especialidad
  obtenerPorEspecialidad(idEspecialidad: number): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(
      `${this.url}/por-especialidad?idEspecialidad=${idEspecialidad}`,
    );
  }

  crear(data: ServicioRequest): Observable<ServicioResponse> {
    return this.http.post<ServicioResponse>(this.url, data);
  }

  desactivar(id: number): Observable<ServicioResponse> {
    return this.http.patch<ServicioResponse>(`${this.url}/${id}/desactivar`, {});
  }
}
