import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { PacienteResponse } from '../../shared/models/paciente.model';
import { CitaResponse } from '../../shared/models/cita.model';
import { tick } from '@angular/core/testing';

interface HistorialResponse {
  idHistorial: number;
  idCita: number;
  fechaCita: string;
  nombrePaciente: string;
  nombreMedico: string;
  nombreServicio: string;
  diagnostico: string;
  tratamiento: string;
  notas: string;
  fechaRegistro: string;
}

interface HistorialRequest {
  idCita: number;
  diagnostico: string;
  tratamiento: string;
  notas: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  historiales: HistorialResponse[] = [];
  pacientes: PacienteResponse[] = [];
  // esto mostrara todas las citas completadas del pacienete para poder elegir cual registrar el historia
  citasCompletadas: CitaResponse[] = [];

  mostrarModal: boolean = false;
  mostrarDetalle: boolean = false;
  cargando: boolean = false;
  pacienteFiltro: number = 0;
  historialSeleccionado: HistorialResponse | null = null;
  // cita seleccionada para poder registrar al historial
  citaSeleccionada: CitaResponse | null = null;

  //----------

  mostrarModalEditar: boolean = false;
  busquedaPaciente: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  //----------

  nuevoHistorial: HistorialRequest = {
    idCita: 0,
    diagnostico: '',
    tratamiento: '',
    notas: '',
  };

  editarHistorial = {
    diagnostico: '',
    tratamiento: '',
    notas: '',
  };

  constructor(
    private http: HttpClient,
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private notificacionService: NotificacionService,
  ) {}

  ngOnInit(): void {
    this.pacienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.pacientes = data;
        // para verificar si viene del screen de pacientes
        const idGuardado = localStorage.getItem('historialPacienteId');
        if (idGuardado) {
          this.pacienteFiltro = parseInt(idGuardado);
          this.onPacienteChange();
          // limpiar para que no se preseleccione en la proxima visita
          localStorage.removeItem('historialPacienteId');
        }
      },
    });
  }

  onPacienteChange(): void {
    if (this.pacienteFiltro === 0) {
      this.historiales = [];
      this.citasCompletadas = [];
      return;
    }
    this.cargando = true;
    // cargar historial del paciente
    this.http
      .get<HistorialResponse[]>(`${environment.apiUrl}/historial/paciente/${this.pacienteFiltro}`)
      .subscribe({
        next: (data) => {
          this.historiales = data;
          this.cargando = false;
        },
        error: () => {
          this.notificacionService.error('Error al cargar historial');
          this.cargando = false;
        },
      });
    this.citaService.obtenerPorPaciente(this.pacienteFiltro).subscribe({
      next: (data) => {
        this.citasCompletadas = data.filter((c) => c.estado === 'COMPLETADA');
      },
    });
  }
  onCitaChange(): void {
    const cita = this.citasCompletadas.find((c) => c.idCita === this.nuevoHistorial.idCita);
    this.citaSeleccionada = cita || null;
  }

  abrirModal(): void {
    if (this.pacienteFiltro === 0) {
      this.notificacionService.error('Selecciona un paciente primero');
      return;
    }
    this.mostrarModal = true;
    this.nuevoHistorial = {
      idCita: 0,
      diagnostico: '',
      tratamiento: '',
      notas: '',
    };
    this.citaSeleccionada = null;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaSeleccionada = null;
  }

  verDetalle(historial: HistorialResponse): void {
    this.historialSeleccionado = historial;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.historialSeleccionado = null;
  }

  crearHistorial(): void {
    if (this.nuevoHistorial.idCita === 0) {
      this.notificacionService.error('Selecciona una cita');
      return;
    }
    if (!this.nuevoHistorial.diagnostico.trim()) {
      this.notificacionService.error('El diagnostico es obligatorio');
      return;
    }
    this.http
      .post<HistorialResponse>(`${environment.apiUrl}/historial`, this.nuevoHistorial)
      .subscribe({
        next: (data) => {
          // permite agregar al inicio de la lista
          this.historiales.unshift(data);
          // quita la cita de las disponibles y pasa a tener un historial registrado
          this.citasCompletadas = this.citasCompletadas.filter(
            (c) => c.idCita !== this.nuevoHistorial.idCita,
          );
          this.cerrarModal();
          this.notificacionService.exito('Historial registrado correctamente');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al registrar historial');
        },
      });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const fechaLimpia = fecha.includes('T') ? fecha : fecha + 'T00:00:00';
    const date = new Date(fechaLimpia);
    // verificar que la fecha es válida antes de formatear
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatearFechaHora(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const fechaLimpia = fecha.includes('T') ? fecha : fecha + 'T00:00:00';
    const date = new Date(fechaLimpia);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ------
  // para buscar pacientes
  get pacientesFiltrados(): PacienteResponse[] {
    if (!this.busquedaPaciente.trim()) {
      return this.pacientes;
    }
    const texto = this.busquedaPaciente.toLowerCase();
    return this.pacientes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.apellido.toLowerCase().includes(texto) ||
        p.dni.includes(texto),
    );
  }

  // el filtro de historial
  get historialesFiltrados(): HistorialResponse[] {
    let resultado = this.historiales;
    if (this.fechaDesde) {
      resultado = resultado.filter((h) => {
        const fecha = h.fechaCita.split('T')[0];
        return fecha >= this.fechaDesde;
      });
    }
    if (this.fechaHasta) {
      resultado = resultado.filter((h) => {
        const fecha = h.fechaCita.split('T')[0];
        return fecha <= this.fechaHasta;
      });
    }

    return resultado.sort(
      (a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime(),
    );
  }

  limpiarFiltrosFecha(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
  }

  // indicar primera consulta
  esPrimeraConsulta(historial: HistorialResponse): boolean {
    const ordenados = this.historialesFiltrados;
    return ordenados.length > 0 && ordenados[0].idHistorial === historial.idHistorial;
  }

  // MODAL
  abrirModalEditar(historial: HistorialResponse): void {
    this.historialSeleccionado = historial;
    this.editarHistorial = {
      diagnostico: historial.diagnostico,
      tratamiento: historial.tratamiento || '',
      notas: historial.notas || '',
    };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.historialSeleccionado = null;
  }

  guardarEdicionHistorial(): void {
    if (!this.historialSeleccionado) return;

    if (!this.editarHistorial.diagnostico.trim()) {
      this.notificacionService.error('El diagnostico el obligatorio');
      return;
    }

    this.http
      .patch<HistorialResponse>(
        `${environment.apiUrl}/historial/${this.historialSeleccionado.idHistorial}/editar`,
        this.editarHistorial,
      )
      .subscribe({
        next: (data) => {
          const index = this.historiales.findIndex((h) => h.idHistorial === data.idHistorial);
          if (index !== -1) this.historiales[index] = data;
          this.cerrarModalEditar();
          this.notificacionService.exito('Historial actualizado');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al editar historial');
        },
      });
  }
  // ------
}
