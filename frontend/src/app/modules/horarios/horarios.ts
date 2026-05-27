import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { HorarioService, HorarioResponse } from '../../core/services/horario.service';
import { MedicoService } from '../../core/services/medico.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { MedicoResponse } from '../../shared/models/medico.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
})
export class Horarios implements OnInit {
  // lista de horarios agrupados por medico
  horarios: HorarioResponse[] = [];
  medicos: MedicoResponse[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;
  // medico seleccionado para filsrar sus horarios
  medicoFiltro: number = 0;

  // nombre del día detectado automáticamente al seleccionar la fecha del calendario
  nombreDiaSeleccionado: string = '';

  // dias de la semana para mostrar en la tabla
  diaSemana: string[] = [
    '',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  // fecha mínima para el calendario, no se puede elegir fechas pasadas
  fechaMinima: string = new Date().toISOString().split('T')[0];

  nuevoHorario = {
    idMedico: 0,
    diaSemana: 0,
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
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

  onFechaChange(): void {
    if (!this.nuevoHorario.fechaInicio) {
      this.nuevoHorario.diaSemana = 0;
      this.nombreDiaSeleccionado = '';
      return;
    }

    // parsear la fecha sin problema de zona horaria
    const partes = this.nuevoHorario.fechaInicio.split('-');
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    // getDay() → 0=domingo ... 6=sábado
    // convertir a nuestro formato: 1=lunes ... 7=domingo
    let diaJS = fecha.getDay();
    this.nuevoHorario.diaSemana = diaJS === 0 ? 7 : diaJS;

    // guardar el nombre del día para mostrarlo
    this.nombreDiaSeleccionado = this.diaSemana[this.nuevoHorario.diaSemana];
  }

  proximasFechas: { fecha: string; label: string }[] = [];

  onDiaSemanaChange(): void {
    if (this.nuevoHorario.diaSemana === 0) {
      this.proximasFechas = [];
      return;
    }

    const hoy = new Date();
    const diaJS = this.nuevoHorario.diaSemana === 7 ? 0 : this.nuevoHorario.diaSemana;
    const hoyDiaJS = hoy.getDay();

    // calcular días hasta el próximo día seleccionado
    let diasHasta = diaJS - hoyDiaJS;
    if (diasHasta <= 0) diasHasta += 7;

    // generar las próximas 4 fechas de ese día
    this.proximasFechas = [];
    for (let i = 0; i < 4; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + diasHasta + i * 7);

      // formato YYYY-MM-DD para enviar al backend
      const fechaISO = fecha.toISOString().split('T')[0];

      // formato legible para mostrar al usuario
      const fechaLabel = fecha.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      this.proximasFechas.push({
        fecha: fechaISO,
        label: fechaLabel,
      });
    }

    // seleccionar la primera fecha automáticamente
    this.nuevoHorario.fechaInicio = this.proximasFechas[0].fecha;
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoHorario = {
      idMedico: this.medicoFiltro || 0,
      diaSemana: 0,
      horaInicio: '',
      horaFin: '',
      fechaInicio: '',
    };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.proximasFechas = [];
  }

  crearHorario(): void {
    if (this.nuevoHorario.idMedico === 0) {
      this.notificacionService.error('Selecciona un médico');
      return;
    }
    if (!this.nuevoHorario.fechaInicio) {
      this.notificacionService.error('Selecciona una fecha');
      return;
    }
    if (!this.nuevoHorario.horaInicio || !this.nuevoHorario.horaFin) {
      this.notificacionService.error('Completa la hora de inicio y fin');
      return;
    }
    if (this.nuevoHorario.horaInicio >= this.nuevoHorario.horaFin) {
      this.notificacionService.error('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    this.http.post<HorarioResponse>(`${environment.apiUrl}/horarios`, this.nuevoHorario).subscribe({
      next: (data) => {
        // guardar el idMedico antes de cerrar el modal
        const idMedicoCreado = data.idMedico;

        // cerrar el modal
        this.cerrarModal();

        // actualizar el filtro y recargar la lista
        this.medicoFiltro = idMedicoCreado;

        // recargar directamente sin depender de onMedicoFiltroChange
        this.cargando = true;
        this.horarioService.obtenerPorMedico(idMedicoCreado).subscribe({
          next: (horarios) => {
            this.horarios = horarios;
            this.cargando = false;
          },
          error: () => {
            this.cargando = false;
          },
        });

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

  formatearFechaInicio(fechaInicio: string): string {
  if (!fechaInicio) return '';
  const partes = fechaInicio.split('-');
  const fecha = new Date(
    parseInt(partes[0]),
    parseInt(partes[1]) - 1,
    parseInt(partes[2])
  );
  return fecha.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}
}
