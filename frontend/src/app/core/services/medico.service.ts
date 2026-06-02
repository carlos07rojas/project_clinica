import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MedicoRequest,
  MedicoResponse,
  MedicoEditarRequest,
} from '../../shared/models/medico.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private url = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<MedicoResponse[]> {
    return this.http.get<MedicoResponse[]>(this.url);
  }

  crear(data: MedicoRequest): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(this.url, data);
  }

  editar(id: number, data: MedicoEditarRequest): Observable<MedicoResponse> {
    return this.http.patch<MedicoResponse>(`${this.url}/${id}/editar`, data);
  }

  obtenerPorEspecialidad(idEspecialidad: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/medico-especialidad/especialidad/${idEspecialidad}`,
    );
  }
}
