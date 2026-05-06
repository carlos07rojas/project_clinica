import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CitaRequest, CitaResponse } from '../../shared/models/cita.model';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private url = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  obtenerPorPaciente(idPaciente: number): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.url}/paciente/${idPaciente}`);
  }

  obtenerPorMedico(idMedico: number): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.url}/medico/${idMedico}`);
  }

  obtenerPorEstado(estado: string): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.url}?estado=${estado}`);
  }

  agendar(data: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.url, data);
  }

  confirmar(id: number): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.url}/${id}/confirmar`, {});
  }

  cancelar(id: number): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.url}/${id}/cancelar`, {});
  }

  completar(id: number, observaciones?: string): Observable<CitaResponse> {
    const params = observaciones ? `?observaciones=${observaciones}` : '';
    return this.http.patch<CitaResponse>(`${this.url}/${id}/completar${params}`, {});
  }
}
