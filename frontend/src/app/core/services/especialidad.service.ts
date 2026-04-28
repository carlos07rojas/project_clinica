// los services hacen las peticiones al backend, es como los Respository de Java
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EspecialidadRequest, EspecialidadResponse } from '../../shared/models/especialidad.model';

// @Injectable hace que angular pueda inyectar este servicio en cualquier componente que lo necesite
@Injectable({
  // providedIn: 'root', siginifica que existe una sola instancia de este servicio en toda la aplicación
  providedIn: 'root',
})
export class EspecialidadService {
  // URL base para las peticiones de especialidades
  private url = `${environment.apiUrl}/especialidades`;

  // HttpClient es un servicio de Angular para hacer peticiones HTTP al backend, a los metodos de Reporsitory de Java
  constructor(private http: HttpClient) {}

  // Observable es como una promesa mejorada que representa un valor que llegará en el futuro cuando el backend responda
  obtenerTodas(): Observable<EspecialidadResponse[]> {
    return this.http.get<EspecialidadResponse[]>(this.url);
  }

  obtenerActivas(): Observable<EspecialidadResponse[]> {
    return this.http.get<EspecialidadResponse[]>(`${this.url}/activas`);
  }

  crear(data: EspecialidadRequest): Observable<EspecialidadResponse> {
    return this.http.post<EspecialidadResponse>(this.url, data);
  }

  desactivar(id: number): Observable<EspecialidadResponse> {
    return this.http.patch<EspecialidadResponse>(`${this.url}/${id}/desactivar`, {});
  }
}
