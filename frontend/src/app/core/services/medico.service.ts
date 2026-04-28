import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicoRequest, MedicoResponse } from '../../shared/models/medico.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private url = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<MedicoResponse[]> {
    return this.http.get<MedicoResponse[]>(this.url);
  }

  obtenerPorEspecialidad(idEspecialidad: number): Observable<MedicoResponse[]> {
    return this.http.get<MedicoResponse[]>(
      `${this.url}/por-especialidad?idEspecialidad=${idEspecialidad}`,
    );
  }

  crear(data: MedicoRequest): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(this.url, data);
  }
}
