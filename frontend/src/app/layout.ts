import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconsModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  menuItems = [
    { ruta: '/especialidades', label: 'Especialidades', icono: 'heroBeaker' },
    { ruta: '/medicos', label: 'Médicos', icono: 'heroUserGroup' },
    { ruta: '/pacientes', label: 'Pacientes', icono: 'heroUser' },
    { ruta: '/servicios', label: 'Servicios', icono: 'heroCurrencyDollar' },
    { ruta: '/citas', label: 'Citas', icono: 'heroCalendarDays' },
    { ruta: '/historial', label: 'Historial', icono: 'heroClipboardDocument' },
    { ruta: '/pagos', label: 'Pagos', icono: 'heroCreditCard' },
  ];
}
