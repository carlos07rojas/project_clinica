import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { HorarioService, HorarioResponse } from '../../core/services/horario.service';
import { MedicoService } from '../../core/services/medico.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { ColorService } from '../../core/services/color.service';
import { EspecialidadResponse } from '../../shared/models/especialidad.model';
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
  especialidades: EspecialidadResponse[] = [];
  especialidadesMedico: EspecialidadResponse[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;
  // medico seleccionado para filsrar sus horarios
  medicoFiltro: number = 0;
  // nombre del día detectado automáticamente al seleccionar la fecha del calendario
  nombreDiaSeleccionado: string = '';
  // fecha mínima para el calendario, no se puede elegir fechas pasadas
  fechaMinima: string = new Date().toISOString().split('T')[0];

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

  nuevoHorario = {
    idMedico: 0,
    idEspecialidad: 0,
    diaSemana: 0,
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
  };

  constructor(
    private horarioService: HorarioService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private notificacionService: NotificacionService,
    public colorService: ColorService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // se carga medicos para el selector
    this.medicoService.obtenerTodos().subscribe({
      next: (data) => (this.medicos = data),
    });
    // colores se calculan automáticamente en tiempo real
    this.especialidadService.obtenerActivas().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.colorService.setEspecialidades(data);
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoHorario = {
      idMedico: this.medicoFiltro || 0,
      idEspecialidad: 0,
      diaSemana: 0,
      horaInicio: '',
      horaFin: '',
      fechaInicio: '',
    };
    this.nombreDiaSeleccionado = '';
    this.especialidadesMedico = [];

    // si ya hay médico filtrado cargar sus especialidades
    if (this.medicoFiltro !== 0) {
      const medico = this.medicos.find((m) => m.idMedico === Number(this.medicoFiltro));
      this.especialidadesMedico = medico?.especialidades || [];
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nombreDiaSeleccionado = '';
    this.especialidadesMedico = [];
    this.proximasFechas = [];
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

  // cuando se cambie el medico en el modal se cargan sus especialidades disponibles
  onMedicoChangeModal(): void {
    if (this.nuevoHorario.idMedico === 0) {
      this.especialidadesMedico = [];
      this.nuevoHorario.idEspecialidad = 0;
      return;
    }

    console.log('médico seleccionado id:', this.nuevoHorario.idMedico);
    console.log('medicos cargados:', this.medicos);

    const medico = this.medicos.find((m) => m.idMedico === Number(this.nuevoHorario.idMedico));

    console.log('médico encontrado:', medico);
    console.log('especialidades del médico:', medico?.especialidades);

    this.especialidadesMedico = medico?.especialidades || [];
    this.nuevoHorario.idEspecialidad = 0;
  }

  //  cuando cambia la fecha detecta el día automáticamente
  onFechaChange(): void {
    if (!this.nuevoHorario.fechaInicio) {
      this.nuevoHorario.diaSemana = 0;
      this.nombreDiaSeleccionado = '';
      return;
    }

    // parsear la fecha sin problema de zona horaria
    const partes = this.nuevoHorario.fechaInicio.split('-');
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

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

  crearHorario(): void {
    if (this.nuevoHorario.idMedico === 0) {
      this.notificacionService.error('Selecciona un médico');
      return;
    }
    if (this.nuevoHorario.idEspecialidad === 0) {
      this.notificacionService.error('Selecciona una especialidad');
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

  duplicarHorario(horario: HorarioResponse): void {
    const partesFin = horario.fechaFin.split('-');
    const fechaFin = new Date(
      parseInt(partesFin[0]),
      parseInt(partesFin[1]),
      parseInt(partesFin[2]),
    );

    // el lunes de la próxima semana es fechaFin + 1 porque fechaFin siempre es domingo
    const lunesProximaSemana = new Date(fechaFin);
    lunesProximaSemana.setDate(fechaFin.getDate() + 1);

    // calcular el día correcto dentro de esa semana
    const proximaFechaInicio = new Date(lunesProximaSemana);
    proximaFechaInicio.setDate(lunesProximaSemana.getDate() + (horario.diaSemana - 1));

    // verificar que no sea en el pasado
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (proximaFechaInicio < hoy) {
      this.notificacionService.error('La proxima fecha ya pasó. Crea el horario nuevamente');
      return;
    }
    const fechaISO = proximaFechaInicio.toISOString().split('T')[0];

    // precargar el modal con los datos del horario actual
    this.nuevoHorario = {
      idMedico: horario.idMedico,
      idEspecialidad: horario.idEspecialidad,
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      fechaInicio: fechaISO,
    };

    // cargar especialidades del medico
    const medico = this.medicos.find((m) => m.idMedico === Number(horario.idMedico));
    this.especialidadesMedico = medico?.especialidades || [];
    // mostrar el nombre del día detectado
    this.nombreDiaSeleccionado = this.diaSemana[horario.diaSemana];
    this.mostrarModal = true;
  }

  esHorarioVigente(fechaFin: string): boolean {
    if (!fechaFin) return true;
    const partes = fechaFin.split('-');
    const fin = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fin >= hoy;
  }

  formatearFechaInicio(fechaInicio: string): string {
    if (!fechaInicio) return '';
    const partes = fechaInicio.split('-');
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const partes = hora.split(':');
    let horas = parseInt(partes[0]);
    const minutos = partes[1];
    const periodo = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    if (horas === 0) horas = 12;
    return `${horas.toString().padStart(2, '0')}:${minutos} ${periodo}`;
  }
}
