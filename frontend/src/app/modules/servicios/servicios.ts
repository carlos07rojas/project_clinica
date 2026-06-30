import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import {
  ServicioService,
  ServicioRequest,
  ServicioResponse,
} from '../../core/services/servicio.service';
import { SolesPipe } from '../../shared/pipes/soles.pipe';
import { NotificacionService } from '../../core/services/notificacion.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { EspecialidadResponse } from '../../shared/models/especialidad.model';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, SolesPipe, NgIconsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios implements OnInit {
  servicios: ServicioResponse[] = [];
  especialidades: EspecialidadResponse[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  // -----------
  mostrarModalEditar: boolean = false;
  servicioSelecc: ServicioResponse | null = null;
  filtroEspecialidad: number = 0;
  busqueda: string = '';

  editarServicio = {
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMin: 0,
  };
  // -----------

  nuevoServicio: ServicioRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMin: 0,
    idEspecialidad: 0,
  };

  constructor(
    private servicioService: ServicioService,
    private especialidadService: EspecialidadService,
    private notificacionService: NotificacionService,
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.especialidadService.obtenerActivas().subscribe({
      next: (data) => (this.especialidades = data),
    });
  }

  cargarServicios(): void {
    this.cargando = true;
    this.servicioService.obtenerTodos().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar Servicios', true);
        this.cargando = false;
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoServicio = {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracionMin: 0,
      idEspecialidad: 0,
    };
    // cargar especialidad activas para el selector
    this.especialidadService.obtenerActivas().subscribe({
      next: (data) => (this.especialidades = data),
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  crearServicio(): void {
    if (!this.nuevoServicio.nombre.trim()) {
      this.mostrarMensaje('El nombre es obligatorio', true);
      return;
    }
    if (this.nuevoServicio.precio <= 0) {
      this.mostrarMensaje('El precio debe ser mayor a 0', true);
      return;
    }
    if (this.nuevoServicio.duracionMin <= 0) {
      this.mostrarMensaje('La duracion debe ser mayor a 0', true);
      return;
    }
    if (this.nuevoServicio.idEspecialidad === 0) {
      this.mostrarMensaje('Selecciona una especialidad', true);
      return;
    }
    this.servicioService.crear(this.nuevoServicio).subscribe({
      next: (data) => {
        this.servicios.push(data);
        this.cerrarModal();
        this.mostrarMensaje('Servicio creado correctamente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear servicio', true);
      },
    });
  }

  desactivarServicio(id: number): void {
    if (!confirm('¿Desactivar este servicio?')) return;

    this.servicioService.desactivar(id).subscribe({
      next: (data) => {
        const index = this.servicios.findIndex((s) => s.idServicio === id);
        if (index !== -1) {
          this.servicios[index] = data;
        }
        this.notificacionService.exito('Servicio desactivad');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al editar');
      },
    });
  }

  // ----------
  get serviciosFiltrados(): ServicioResponse[] {
    return this.servicios.filter((svr) => {
      const coincideEsp =
        this.filtroEspecialidad === 0 || svr.idEspecialidad === this.filtroEspecialidad;
      const coincideBusq =
        !this.busqueda || svr.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      return coincideEsp && coincideBusq;
    });
  }

  abrirModalEditar(svr: ServicioResponse): void {
    this.servicioSelecc = svr;
    this.editarServicio = {
      nombre: svr.nombre,
      descripcion: svr.descripcion || '',
      precio: svr.precio,
      duracionMin: svr.duracionMin,
    };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.servicioSelecc = null;
  }

  guardarEdicion(): void {
    if (!this.servicioSelecc) return;

    if (!this.editarServicio.nombre.trim()) {
      this.notificacionService.error('El nombre es obligatorio');
      return;
    }
    if (this.editarServicio.precio <= 0) {
      this.notificacionService.error('El precio debe ser mayor a 0');
      return;
    }
    if (this.editarServicio.duracionMin <= 0) {
      this.notificacionService.error('La duracion debe ser mayor a 0');
      return;
    }

    this.servicioService.editar(this.servicioSelecc.idServicio, this.editarServicio).subscribe({
      next: (data) => {
        const index = this.servicios.findIndex((s) => s.idServicio === data.idServicio);
        if (index !== -1) this.servicios[index] = data;
        this.cerrarModalEditar();
        this.notificacionService.exito('Servicio actualizado');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al editar');
      },
    });
  }

  reactivarServicio(id: number): void {
    if (!confirm('¿Reactivar servicio?')) return;
    this.servicioService.reactivar(id).subscribe({
      next: (data) => {
        const index = this.servicios.findIndex((s) => s.idServicio === id);
        if (index !== -1) this.servicios[index] = data;
        this.notificacionService.exito('Servicio reactivado');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al reactivar');
      },
    });
  }
  // ----------
  private mostrarMensaje(texto: string, esError: boolean): void {
    if (esError) {
      this.notificacionService.error(texto);
    } else {
      this.notificacionService.exito(texto);
    }
  }
}
