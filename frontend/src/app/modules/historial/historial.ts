import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { PacienteResponse } from '../../shared/models/paciente.model';
import { CitaResponse } from '../../shared/models/cita.model';

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
  imports: [CommonModule, FormsModule],
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

  nuevoHistorial: HistorialRequest = {
    idCita: 0,
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
      next: (data) => (this.pacientes = data),
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

    // corregir el parseo para evitar Invalid Date
    // algunos formatos de fecha no son reconocidos
    // correctamente por todos los navegadores
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
