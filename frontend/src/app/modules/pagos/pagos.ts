import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SolesPipe } from '../../shared/pipes/soles.pipe';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { PacienteResponse } from '../../shared/models/paciente.model';
import { CitaResponse } from '../../shared/models/cita.model';
import { retry } from 'rxjs';

interface PagoResponse {
  idPago: number;
  idCita: number;
  nombrePaciente: string;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  fechaPago: string;
  comprobante: string;
}

interface PagoRequest {
  idCita: number;
  monto: number;
  metodoPago: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, SolesPipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  pagos: PagoResponse[] = [];
  pacientes: PacienteResponse[] = [];
  // se jalara las citas completadas por el paciente sin pago registrado
  citasCompleSinPago: CitaResponse[] = [];

  mostrarModal: boolean = false;
  mostrarModalConfirmar: boolean = false;
  cargando: boolean = false;
  // se jalara a los pacientes seleccionados para poder filtrar sus pagos
  pacienteFiltro: number = 0;
  // el filtro de estado de pago
  filtroEstado: string = '';
  // pago seleccionado para poder confirmar o anular
  pagoSelecc: PagoResponse | null = null;
  // cita seleccionada en el modal
  citaSelecc: CitaResponse | null = null;

  nuevoPago: PagoRequest = {
    idCita: 0,
    monto: 0,
    metodoPago: '',
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
    // se cargan todos los pagos al inicio
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    // cargar pagos por estado o todos
    const url = this.filtroEstado
      ? `${environment.apiUrl}/pagos?estadoPago=${this.filtroEstado}`
      : `${environment.apiUrl}/pagos?estadoPago=PENDIENTE`;

    this.http.get<PagoResponse[]>(url).subscribe({
      next: (data) => {
        this.pagos = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  onFiltroEstadoChange(): void {
    this.cargarPagos();
  }

  // cuando se cargue una cita seleccionada en el modal, esto permitira que se cargue el monto del servicio automaticamente
  onCitaChange(): void {
    const cita = this.citasCompleSinPago.find((c) => c.idCita === this.nuevoPago.idCita);
    this.citaSelecc = cita || null;
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoPago = {
      idCita: 0,
      monto: 0,
      metodoPago: '',
    };
    this.citaSelecc = null;
    this.citasCompleSinPago = [];

    // primero obtener todas las citas completadas
    this.http.get<CitaResponse[]>(`${environment.apiUrl}/citas?estado=COMPLETADA`).subscribe({
      next: (citasCompletadas) => {
        if (citasCompletadas.length === 0) {
          this.notificacionService.error('No hay citas completadas en el sistema');
          return;
        }

        // luego obtener todos los pagos existentes para filtrar las citas que ya tienen pago
        this.http
          .get<PagoResponse[]>(`${environment.apiUrl}/pagos?estadoPago=PENDIENTE`)
          .subscribe({
            next: (pagosPendientes) => {
              this.http
                .get<PagoResponse[]>(`${environment.apiUrl}/pagos?estadoPago=PAGADO`)
                .subscribe({
                  next: (pagosPagados) => {
                    // combinar todos los pagos existentes
                    const todosPagos = [...pagosPendientes, ...pagosPagados];
                    const idsCitasConPago = todosPagos.map((p) => p.idCita);

                    // mostrar solo citas sin pago registrado
                    this.citasCompleSinPago = citasCompletadas.filter(
                      (c) => !idsCitasConPago.includes(c.idCita),
                    );

                    if (this.citasCompleSinPago.length === 0) {
                      this.notificacionService.error(
                        'Todas las citas completadas ya tienen pago registrado',
                      );
                    }
                  },
                });
            },
          });
      },
      error: () => {
        this.notificacionService.error('Error al cargar citas completadas');
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaSelecc = null;
    this.citasCompleSinPago = [];
  }

  registrarPago(): void {
    if (this.nuevoPago.idCita === 0) {
      this.notificacionService.error('Selecciona una cita');
      return;
    }
    if (this.nuevoPago.monto <= 0) {
      this.notificacionService.error('El monto debe ser mayor a 00.00');
      return;
    }
    if (!this.nuevoPago.metodoPago) {
      this.notificacionService.error('Selecciona un metodo de pago');
      return;
    }
    this.http.post<PagoResponse>(`${environment.apiUrl}/pagos`, this.nuevoPago).subscribe({
      next: (data) => {
        this.pagos.unshift(data);
        this.cerrarModal();
        this.notificacionService.exito('Pago registrado correctamente');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al registrar pago');
      },
    });
  }

  confirmarPago(pago: PagoResponse): void {
    if (!confirm(`¿Confirmar pago de S/ ${pago.monto} de ${pago.nombrePaciente}?`)) return;
    this.http
      .patch<PagoResponse>(`${environment.apiUrl}/pagos/${pago.idPago}/confirmar`, {})
      .subscribe({
        next: (data) => {
          const index = this.pagos.findIndex((p) => p.idPago === pago.idPago);
          if (index !== -1) this.pagos[index] = data;
          this.notificacionService.exito('Pago confirmado correctamente');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al confirmar pago');
        },
      });
  }

  anularPago(pago: PagoResponse): void {
    if (!confirm(`¿Anular pago de S/${pago.monto} de ${pago.nombrePaciente}?`)) return;
    this.http
      .patch<PagoResponse>(`${environment.apiUrl}/pagos/${pago.idPago}/anular`, {})
      .subscribe({
        next: (data) => {
          const index = this.pagos.findIndex((p) => p.idPago === pago.idPago);
          if (index !== -1) this.pagos[index] = data;
          this.notificacionService.exito('Pago anulado');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al anular pago');
        },
      });
  }

  // trae todos los pagos pendientes
  get totalPendiente(): number {
    return this.pagos
      .filter((p) => p.estadoPago === 'PENDIENTE')
      .reduce((sum, p) => sum + p.monto, 0);
  }

  // trae el total cobrado
  get totalCobrado(): number {
    return this.pagos.filter((p) => p.estadoPago === 'PAGADO').reduce((sum, p) => sum + p.monto, 0);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const fechaLimpia = fecha.includes('T') ? fecha : fecha + 'T00:00:00';
    const date = new Date(fechaLimpia);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
