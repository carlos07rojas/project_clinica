import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ServicioService, ServicioResponse } from '../../core/services/servicio.service';
import { HorarioService, HorarioResponse } from '../../core/services/horario.service';
import { CitaRequest, CitaResponse } from '../../shared/models/cita.model';
import { MedicoResponse } from '../../shared/models/medico.model';
import { PacienteResponse } from '../../shared/models/paciente.model';
import { EspecialidadResponse } from '../../shared/models/especialidad.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css',
})
export class Citas implements OnInit {
  // todas las citas se cargan desde el backend
  todasLasCitas: CitaResponse[] = [];

  // listas para los selectores del modal
  pacientes: PacienteResponse[] = [];
  especialidades: EspecialidadResponse[] = [];
  medicos: MedicoResponse[] = [];
  servicios: ServicioResponse[] = [];
  horariosMedico: HorarioResponse[] = [];
  horasDisponibles: string[] = [];

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

  // permite controlar segun su estado de todas las citas
  filtroEstado: string = '';

  mostrarModal: boolean = false;
  mostrarModalCompletar: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  // objeto del formulario de agendar cita
  nuevaCita: CitaRequest = {
    idPaciente: 0,
    idMedico: 0,
    idServicio: 0,
    fechaHora: '',
    observaciones: '',
  };

  // se usara para saber cual cita se debe completar al confirmar
  idCitaACompletar: number = 0;
  obserCompletar: string = '';

  // las especialidades seleccionanadas en el modal, se recargan medicos y servicios
  idEspecialidadSelecc: number = 0;

  constructor(
    private citaService: CitaService,
    private medicoService: MedicoService,
    private pacienteService: PacienteService,
    private especialidadService: EspecialidadService,
    private servicioService: ServicioService,
    private horarioService: HorarioService,
    private notificacionService: NotificacionService,
  ) {}

  ngOnInit(): void {
    this.cargarTodasLasCitas();
  }

  // cargamos todas las citas del sistema
  cargarTodasLasCitas(): void {
    this.cargando = true;

    // esto es una agregacion que se modificara mas adelante
    this.citaService.obtenerPorEstado('PENDIENTE').subscribe({
      next: (pendientes) => {
        this.citaService.obtenerPorEstado('CONFIRMADA').subscribe({
          next: (confirmadas) => {
            this.citaService.obtenerPorEstado('COMPLETADA').subscribe({
              next: (completadas) => {
                this.citaService.obtenerPorEstado('CANCELADA').subscribe({
                  next: (canceladas) => {
                    // se combina todo en una sola lista
                    this.todasLasCitas = [
                      ...pendientes,
                      ...confirmadas,
                      ...completadas,
                      ...canceladas,
                    ];
                    this.cargando = false;
                  },
                  error: () => {
                    this.cargando = false;
                  },
                });
              },
              error: () => {
                this.cargando = false;
              },
            });
          },
          error: () => {
            this.cargando = false;
          },
        });
      },
      error: () => {
        this.mostrarMensaje('Error al cargar citas', true);
        this.cargando = false;
      },
    });
  }

  // filtrara las citas segun su estado, si filtroEstado esta vacio devuelve todas
  get citasFiltradas(): CitaResponse[] {
    if (!this.filtroEstado) {
      return this.todasLasCitas;
    }
    return this.todasLasCitas.filter((c) => c.estado === this.filtroEstado);
  }

  // cuenta las citas por estado para mostrarlo
  contarPorEstado(estado: string): number {
    return this.todasLasCitas.filter((c) => c.estado === estado).length;
  }

  // verifica si la cita es del dia para reslatarla visualmente
  esCitaHoy(fechaHora: string): boolean {
    const hoy = new Date();
    const fechaCita = new Date(fechaHora);
    return hoy.toDateString() === fechaCita.toDateString();
  }

  // formatea la fecha para tener una mejor visualizacion de esta
  formatearFecha(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return (
      fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      }) +
      ', ' +
      fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevaCita = {
      idPaciente: 0,
      idMedico: 0,
      idServicio: 0,
      fechaHora: '',
      observaciones: '',
    };
    this.idEspecialidadSelecc = 0;
    this.medicos = [];
    this.servicios = [];

    // se carga pacientes para el selector
    this.pacienteService.obtenerTodos().subscribe({
      next: (data) => (this.pacientes = data),
    });

    // se carga especialidades activas para el selector
    this.especialidadService.obtenerTodas().subscribe({
      next: (data) => (this.especialidades = data),
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  // esto hara que cuando se seleccione una especialidad, se recarge automaticamente medicos y servicios para que el usuario solo vea opciones validas
  onEspecialidadChange(): void {
    if (this.idEspecialidadSelecc === 0) {
      this.medicos = [];
      this.servicios = [];
      this.nuevaCita.idMedico = 0;
      this.nuevaCita.idServicio = 0;
      return;
    }
    // para cargar medicos de la especialidad seleccionada
    this.medicoService.obtenerPorEspecialidad(this.idEspecialidadSelecc).subscribe({
      next: (data) => {
        this.medicos = data;
        this.nuevaCita.idMedico = 0;
      },
    });

    // para cargar servicios de la especialidad seleccionada
    this.servicioService.obtenerPorEspecialidad(this.idEspecialidadSelecc).subscribe({
      next: (data) => {
        this.servicios = data;
        this.nuevaCita.idServicio = 0;
      },
    });
  }

  agendarCita(): void {
    // validacion antes de enviar al backend
    if (this.nuevaCita.idPaciente === 0) {
      this.mostrarMensaje('Selecciona un paciente', true);
      return;
    }
    if (this.idEspecialidadSelecc === 0) {
      this.mostrarMensaje('Selecciona una especialidad', true);
      return;
    }
    if (this.nuevaCita.idMedico === 0) {
      this.mostrarMensaje('Seleccion un medico', true);
      return;
    }
    if (this.nuevaCita.idServicio === 0) {
      this.mostrarMensaje('Selecciona un servicio', true);
      return;
    }
    if (!this.nuevaCita.fechaHora) {
      this.mostrarMensaje('Selecciona fecha y hora', true);
      return;
    }

    //verificar que se haya seleccionado una hora si fechaHora no contiene 'T' significa que solo tiene la fecha pero no la hora
    if (!this.nuevaCita.fechaHora.includes('T')) {
      this.mostrarMensaje('Selecciona una hora disponible', true);
      return;
    }

    this.citaService.agendar(this.nuevaCita).subscribe({
      next: (data) => {
        // esto agrega una nueva cita al inicio de la cita
        this.todasLasCitas.unshift(data);
        this.cerrarModal();
        this.mostrarMensaje('Cita agendada correctamente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al agendar cita', true);
      },
    });
  }

  confirmarCita(idCita: number): void {
    this.citaService.confirmar(idCita).subscribe({
      next: (data) => {
        this.actualizarCitaLista(data);
        this.mostrarMensaje('Cita condirmada', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error', true);
      },
    });
  }

  cancelarCita(idCita: number): void {
    if (!confirm('¿Cancelar esta cita?')) return;

    this.citaService.cancelar(idCita).subscribe({
      next: (data) => {
        this.actualizarCitaLista(data);
        this.mostrarMensaje('Cita cancelada', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error', true);
      },
    });
  }

  // abre el modal de completar con el id de la cita
  abrirModalCompletar(idCita: number): void {
    this.idCitaACompletar = idCita;
    this.obserCompletar = '';
    this.mostrarModalCompletar = true;
  }

  cerrarModalCompletar(): void {
    this.mostrarModalCompletar = false;
  }

  completarCita(): void {
    this.citaService.completar(this.idCitaACompletar, this.obserCompletar).subscribe({
      next: (data) => {
        this.actualizarCitaLista(data);
        this.cerrarModalCompletar();
        this.mostrarMensaje('Cita completada correctamente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error', true);
      },
    });
  }

  // se cargara automaticamente cuando se modifique la disponibilidad del medico
  onMedicoChange(): void {
    if (this.nuevaCita.idMedico === 0) {
      this.horariosMedico = [];
      this.horasDisponibles = [];
      return;
    }
    this.horarioService.obtenerPorMedico(this.nuevaCita.idMedico).subscribe({
      next: (data) => {
        //  solo mostrara horarios activos
        this.horariosMedico = data.filter((h) => h.activo);
      },
    });
  }

  // genera las horas disponibles segun el horario del medico
  generarHorasDisponibles(): void {
    if (!this.nuevaCita.fechaHora || this.horariosMedico.length === 0) {
      return;
    }

    const partesFecha = this.nuevaCita.fechaHora.split('T')[0].split('-');
    const año = parseInt(partesFecha[0]);
    const mes = parseInt(partesFecha[1]) - 1;
    const dia = parseInt(partesFecha[2]);

    // obtiene del dia seleccionada
    const fecha = new Date(año, mes, dia);
    let diaSemana = fecha.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana;

    // permite buscar el horario del medico para el dia
    const horarioDelDia = this.horariosMedico.find((h) => h.diaSemana === diaSemana);
    if (!horarioDelDia) {
      this.horasDisponibles = [];
      this.mostrarMensaje(
        `El medico no trabaja ese dia. Trabaja: ${this.horariosMedico.map((h) => this.diaSemana[h.diaSemana]).join(', ')}`,
        true,
      );
      return;
    }

    // condicion para que la fecha seleccionada no puede ser anterior a la fecha de inicio del horario
    if (horarioDelDia.fechaInicio) {
      const fechaInicioHorario = new Date(horarioDelDia.fechaInicio + 'T00:00:00');
      if (fecha < fechaInicioHorario) {
        this.horasDisponibles = [];
        this.notificacionService.error(
          `Este horario aplica desde el ${new Date(horarioDelDia.fechaInicio).toLocaleDateString(
            'es-PE',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            },
          )}`,
        );
        return;
      }
    }

    // generar slots de tiempo cada 30 min
    const horas: string[] = [];
    const [horaIni, minIni] = horarioDelDia.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horarioDelDia.horaFin.split(':').map(Number);

    let hora = horaIni;
    let min = minIni;

    while (hora < horaFin || (hora === horaFin && min < minFin)) {
      horas.push(`${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      min += 30;
      if (min >= 60) {
        min = 0;
        hora++;
      }
    }
    this.horasDisponibles = horas;
  }

  // con esto se verificara si el medico esta disponible ese dia cuando el paciente seleccione una fecha
  onFechaChange(): void {
    // limpia la hora seleccionada cuando cambia la fecha para que el usuario tenga que elegir hora de nuevo
    const fecha = this.nuevaCita.fechaHora;
    this.nuevaCita.fechaHora = fecha;
    this.generarHorasDisponibles();
  }

  onHoraChange(hora: string): void {
    if (!this.nuevaCita.fechaHora) return;
    const fecha = this.nuevaCita.fechaHora.split('T')[0];
    this.nuevaCita.fechaHora = `${fecha}T${hora}:00`;
  }

  // esto calculara la proxima fecha concreta para un dia de la semana
  proximaFecha(diaSemana: number): string {
    const hoy = new Date();
    const diaJS = diaSemana === 7 ? 0 : diaSemana;
    const hoyDiaJS = hoy.getDay();

    // días hasta el próximo día de trabajo
    let diasHasta = diaJS - hoyDiaJS;
    if (diasHasta <= 0) diasHasta += 7;

    const proxima = new Date(hoy);
    proxima.setDate(hoy.getDate() + diasHasta);

    return proxima.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  // método privado para actualizar una cita en la lista local
  private actualizarCitaLista(citaActualizada: CitaResponse): void {
    const index = this.todasLasCitas.findIndex((c) => c.idCita === citaActualizada.idCita);
    if (index !== -1) {
      this.todasLasCitas[index] = citaActualizada;
    }
  }

  private mostrarMensaje(texto: string, esError: boolean): void {
    if (esError) {
      this.notificacionService.error(texto);
    } else {
      this.notificacionService.exito(texto);
    }
  }
}
