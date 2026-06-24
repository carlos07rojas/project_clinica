import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HorarioResponse {
  idHorario: number;
  idMedico: number;
  nombreMedico: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  fechaInicio: string;
  fechaFin: string;
  idEspecialidad: number;
  nombreEspecialidad: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private url = `${environment.apiUrl}/horarios`;

  constructor(private http: HttpClient) {}

  obtenerPorMedico(idMedico: number): Observable<HorarioResponse[]> {
    return this.http.get<HorarioResponse[]>(`${this.url}/medico/${idMedico}`);
  }
}
