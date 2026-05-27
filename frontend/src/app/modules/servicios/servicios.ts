import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, SolesPipe],
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
        this.mostrarMensaje('Servicio desactivad', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error', true);
      },
    });
  }

  private mostrarMensaje(texto: string, esError: boolean): void {
    if (esError) {
      this.notificacionService.error(texto);
    } else {
      this.notificacionService.exito(texto);
    }
  }
}
