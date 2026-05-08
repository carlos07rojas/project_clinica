import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService, HorarioResponse } from '../../core/services/horario.service';
import { MedicoService } from '../../core/services/medico.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { MedicoResponse } from '../../shared/models/medico.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
})
export class Horarios implements OnInit {
  // lista de horarios agrupados por medico
  horarios: HorarioResponse[] = [];
  medicos: MedicoResponse[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;

  // dias de la semana para mostrar en la tabla
  diasSemana: string[] = ['', 'Lunes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // medico seleccionado para filsrar sus horarios
  medicoFiltro: number = 0;

  nuevoHorario = {
    idMedico: 0,
    diaSemana: 0,
    horaInicio: '',
    horaFin: '',
  };

  constructor(
    private horarioService: HorarioService,
    private medicoService: MedicoService,
    private notificacionService: NotificacionService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // se carga medicos para el selector
    this.medicoService.obtenerTodos().subscribe({
      next: (data) => (this.medicos = data),
    });
  }

  // se obtiene horarios del medico seleccionado
  onMedicoFiltroChange(): void {
    if (this.medicoFiltro === 0) {
      this.horarios = [];
      return;
    }
    this.cargando = true;
    this.horarioService.obtenerPorMedico(this.medicoFiltro).subscribe({
      next: (data) => {
        this.horarios = data;
        this.cargando = false;
      },
      error: () => {
        this.notificacionService.error('Error al cargar horarios');
        this.cargando = false;
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoHorario = {
      idMedico: this.medicoFiltro || 0,
      diaSemana: 0,
      horaInicio: '',
      horaFin: '',
    };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  crearHorario(): void {
    if (this.nuevoHorario.idMedico === 0) {
      this.notificacionService.error('Selecciona un médico');
      return;
    }
    if (this.nuevoHorario.diaSemana === 0) {
      this.notificacionService.error('Seleccion un día');
      return;
    }
    if (!this.nuevoHorario.horaInicio || !this.nuevoHorario.horaFin) {
      this.notificacionService.error('completa los horarios de inicio y fin');
      return;
    }
    if (this.nuevoHorario.horaInicio >= this.nuevoHorario.horaFin) {
      this.notificacionService.error('La hora de Fin debe ser mayor que la hora de Inicio');
      return;
    }
    // se hace el POST directo con HttpClient porque el HorarioService solo tiene GET
    this.http.post<HorarioResponse>(`${environment.apiUrl}/horarios`, this.nuevoHorario).subscribe({
      next: (data) => {
        if (this.medicoFiltro === data.idMedico) {
          this.horarios.push(data);
        }
        this.cerrarModal();
        this.notificacionService.exito('Horario creado correctamente');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al crear horario');
      },
    });
  }

  desactivarHorario(id: number): void {
    if (!confirm('¿Desactivar este horario?')) return;
    this.http
      .patch<HorarioResponse>(`${environment.apiUrl}/horarios/${id}/desactivar`, {})
      .subscribe({
        next: (data) => {
          const index = this.horarios.findIndex((h) => h.idHorario === id);
          if (index !== -1) this.horarios[index] = data;
          this.notificacionService.exito('Horario desactivado');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al desactivar');
        },
      });
  }
}
