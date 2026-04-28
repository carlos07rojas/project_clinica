import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRequest, PagoResponse } from '../../shared/models/pago.model';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private url = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  obtemerPorEstado(estadoPago: string): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.url}?estadoPago=${estadoPago}`);
  }

  registrar(data: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.url, data);
  }

  confirmar(id: number): Observable<PagoResponse> {
    return this.http.patch<PagoResponse>(`${this.url}/${id}/confirmar`, {});
  }

  anular(id: number): Observable<PagoResponse> {
    return this.http.patch<PagoResponse>(`${this.url}/${id}/anular`, {});
  }
}
