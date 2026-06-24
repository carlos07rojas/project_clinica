import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private especialidades: { idEspecialidad: number }[] = [];

  setEspecialidades(especialidades: { idEspecialidad: number }[]): void {
    this.especialidades = especialidades;
  }

  private getIndex(idEspecialidad: number): number {
    return this.especialidades.findIndex((e) => e.idEspecialidad === idEspecialidad);
  }

  // HSL distribuye los colores uniformemente
  private generarColor(index: number, total: number): string {
    if (total === 0) return 'hsl(210, 65%, 45%)';
    const hue = Math.round((index * 360) / total);
    return `hsl(${hue}, 65%, 45%)`;
  }
  private generarColorFondo(index: number, total: number): string {
    if (total === 0) return 'hsl(210, 65%, 95%)';
    const hue = Math.round((index * 360) / total);
    return `hsl(${hue}), 65%, 95%`;
  }
  getColor(idEspecialidad: number): string {
    const index = this.getIndex(idEspecialidad);
    if (index === -1) return '#888780';
    return this.generarColor(index, this.especialidades.length);
  }
  getFondo(idEspecialidad: number): string {
    const index = this.getIndex(idEspecialidad);
    if (index === -1) return '#f5f5f5';
    return this.generarColorFondo(index, this.especialidades.length);
  }
}
