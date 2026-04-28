import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PacienteRequest, PacienteResponse } from '../../shared/models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private url = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<PacienteResponse[]> {
    return this.http.get<PacienteResponse[]>(this.url);
  }

  obtenerPorId(id: number): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.url}/${id}`);
  }

  buscarPorDni(dni: string): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.url}/buscar?dni=${dni}`);
  }

  crear(data: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.url, data);
  }
}
