import { Routes } from '@angular/router';
import { LayoutComponent } from './layout';
import { Especialidades } from './modules/especialidades/especialidades';
import { Medicos } from './modules/medicos/medicos';
import { Pacientes } from './modules/pacientes/pacientes';
import { Citas } from './modules/citas/citas';
import { Historial } from './modules/historial/historial';
import { Pagos } from './modules/pagos/pagos';
import { Servicios } from './modules/servicios/servicios';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'especialidades', pathMatch: 'full' },
      { path: 'especialidades', component: Especialidades },
      { path: 'medicos', component: Medicos },
      { path: 'pacientes', component: Pacientes },
      { path: 'citas', component: Citas },
      { path: 'historial', component: Historial },
      { path: 'pagos', component: Pagos },
      { path: 'servicios', component: Servicios },
    ],
  },
];
