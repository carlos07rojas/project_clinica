import { Pipe, PipeTransform } from '@angular/core';

// pipe reutilizable para formatear montos en soles
@Pipe({
  name: 'soles',
  standalone: true,
})
export class SolesPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'S/0.00';
    return `S/${value.toFixed(2)}`;
  }
}
