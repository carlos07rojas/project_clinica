import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { Notification } from './shared/notification';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconsModule, Notification],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  menuItems = [
    { ruta: '/especialidades', label: 'Especialidades', icono: 'heroBeaker' },
    { ruta: '/medicos', label: 'Médicos', icono: 'heroUserGroup' },
    { ruta: '/horarios', label: 'Horarios', icono: 'heroClock' },
    { ruta: '/pacientes', label: 'Pacientes', icono: 'heroUser' },
    { ruta: '/servicios', label: 'Servicios', icono: 'heroCurrencyDollar' },
    { ruta: '/citas', label: 'Citas', icono: 'heroCalendarDays' },
    { ruta: '/historial', label: 'Historial', icono: 'heroClipboardDocument' },
    { ruta: '/pagos', label: 'Pagos', icono: 'heroCreditCard' },
  ];
}
