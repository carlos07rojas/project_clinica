import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// interfaz que define una notificación
export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  // BehaviorSubject mantiene el estado de las notificaciones y notifica a los suscriptores cuando cambia
  private notificacionsSubject = new BehaviorSubject<Notificacion[]>([]);

  // observable hace que los componentes pueden escuchar
  notificacion$ = this.notificacionsSubject.asObservable();

  // contador para generar IDs únicos
  private contador = 0;

  // agregar una notificación de éxito
  exito(mensaje: string, duracion: number = 3000): void {
    this.agregar(mensaje, 'exito', duracion);
  }

  // agregar una notificación de error
  error(mensaje: string, duracion: number = 4000): void {
    this.agregar(mensaje, 'error', duracion);
  }

  remove(id: number): void {
    const actuales = this.notificacionsSubject.getValue();
    this.notificacionsSubject.next(actuales.filter((n) => n.id !== id));
  }

  private agregar(mensaje: string, tipo: 'exito' | 'error', duracion: number): void {
    const id = ++this.contador;
    const actuales = this.notificacionsSubject.getValue();

    const nuevas: Notificacion[] = [...actuales, { id, mensaje, tipo }];

    this.notificacionsSubject.next(nuevas);

    setTimeout(() => this.remove(id), duracion);
  }
}
