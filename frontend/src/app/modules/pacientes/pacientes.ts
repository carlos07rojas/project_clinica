import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { HttpClient } from '@angular/common/http';
import { PacienteService } from '../../core/services/paciente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { CitaService } from '../../core/services/cita.service';
import { CitaResponse } from '../../shared/models/cita.model';
import { PacienteRequest, PacienteResponse } from '../../shared/models/paciente.model';
import { UsuarioResponse } from '../../shared/models/usuario.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class Pacientes implements OnInit {
  // se muestra la lista de pacientes en la tabla
  pacientes: PacienteResponse[] = [];

  // se muestra la lista de usuarios con rol pacientes para el selector
  usuarioPaciente: UsuarioResponse[] = [];
  mostrarModal: boolean = false;
  mostrarModalUsuario: boolean = false;
  mostrarModalEditar: boolean = false;
  pacienteSelecc: PacienteResponse | null = null;
  telefonoEditar: string = '';
  emailEditar: string = '';
  direccionEditar: string = '';
  cargando: boolean = false;
  mensaje: string = '';
  esError: boolean = false;
  // texto para filtrar por nombre, que se usa para una busqueda local en tiempo real
  textoBusqueda: string = '';
  // esto permitira buscar directamente en el backend con el DNI
  dniBusqueda: string = '';
  // se mostrar cuando el paciente se haya encontrado
  pacienteEncontrado: PacienteResponse | null = null;

  // ---------------

  mostrarModalCitas: boolean = false;
  pacienteCitas: CitaResponse[] = [];
  cargandoCitas: boolean = false;

  // ---------------

  // objeto del formulario para crear el paciente
  nuevoPaciente: PacienteRequest = {
    idUsuario: 0,
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    direccion: '',
    sexo: '',
  };

  // objeto del formulario para crear el usuario paciente
  nuevoUsuarioPaciente = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'PACIENTE',
  };

  constructor(
    private pacienteService: PacienteService,
    private usuarioService: UsuarioService,
    private citaService: CitaService,
    private notificacionService: NotificacionService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.pacienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar pacientes', true);
        this.cargando = false;
      },
    });
  }

  // getter que filtra la lista según el texto de búsqueda | no hace peticiones al backend, filtra los datos ya cargados
  get pacientesFiltrados(): PacienteResponse[] {
    if (!this.textoBusqueda.trim()) {
      return this.pacientes;
    }
    const texto = this.textoBusqueda.toLowerCase();
    return this.pacientes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.apellido.toLowerCase().includes(texto) ||
        p.dni.includes(texto) ||
        p.email.toLowerCase().includes(texto),
    );
  }

  // búsqueda por DNI en el backend
  buscarPorDni(): void {
    if (!this.dniBusqueda.trim()) {
      this.mostrarMensaje('Ingresar un DNI para buscar', true);
      return;
    }
    this.pacienteService.buscarPorDni(this.dniBusqueda).subscribe({
      next: (data) => {
        this.pacienteEncontrado = data;
      },
      error: (err) => {
        this.pacienteEncontrado = null;
        this.mostrarMensaje(err.error?.mensaje || 'Paciente no encontrado', true);
      },
    });
  }

  limpiarBusquedaDni(): void {
    this.dniBusqueda = '';
    this.pacienteEncontrado = null;
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoPaciente = {
      idUsuario: 0,
      dni: '',
      fechaNacimiento: '',
      telefono: '',
      direccion: '',
      sexo: '',
    };
    this.usuarioService.obtenerTodo().subscribe({
      next: (data) => {
        this.usuarioPaciente = data.filter((u) => u.rol === 'PACIENTE');
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  abrirModalUsuario(): void {
    this.mostrarModalUsuario = true;
    this.nuevoUsuarioPaciente = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'PACIENTE',
    };
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
  }

  crearUsuarioPaciente(): void {
    if (
      !this.nuevoUsuarioPaciente.nombre.trim() ||
      !this.nuevoUsuarioPaciente.email.trim() ||
      !this.nuevoUsuarioPaciente.password.trim()
    ) {
      this.mostrarMensaje('Nombre, Email y contraseña son obligatorios', true);
      return;
    }

    if (this.nuevoUsuarioPaciente.password.length < 8) {
      this.notificacionService.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.usuarioService.crear(this.nuevoUsuarioPaciente).subscribe({
      next: (data) => {
        this.usuarioPaciente.push(data);
        this.nuevoPaciente.idUsuario = data.idUsuario;
        this.cerrarModalUsuario();
        this.mostrarMensaje('Usuario creado, Completa los datos del paciente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear Usuario', true);
      },
    });
  }

  crearPaciente(): void {
    if (this.nuevoPaciente.idUsuario === 0) {
      this.mostrarMensaje('Selecciona un usuario', true);
      return;
    }
    if (!this.nuevoPaciente.dni.trim()) {
      this.mostrarMensaje('El DNI es obligatorio', true);
      return;
    }
    if (!this.nuevoPaciente.fechaNacimiento) {
      this.mostrarMensaje('La fecha de nacimiento es obligatoria', true);
      return;
    }
    if (!this.nuevoPaciente.sexo) {
      this.mostrarMensaje('El sexo es obligatorio', true);
      return;
    }
    // validar que el teléfono sea solo números si fue ingresado
    if (this.nuevoPaciente.telefono && !/^\d{9}$/.test(this.nuevoPaciente.telefono)) {
      this.notificacionService.error('El teléfono debe tener exactamente 9 dígitos numéricos');
      return;
    }

    this.pacienteService.crear(this.nuevoPaciente).subscribe({
      next: (data) => {
        this.pacientes.push(data);
        this.cerrarModal();
        this.mostrarMensaje('Paciente registrado correctamente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear paciente', true);
      },
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  abrirModalEditar(paciente: PacienteResponse): void {
    this.pacienteSelecc = paciente;
    this.telefonoEditar = paciente.telefono || '';
    this.emailEditar = paciente.email || '';
    this.direccionEditar = paciente.direccion || '';
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.pacienteSelecc = null;
  }

  guardarEdicion(): void {
    if (!this.pacienteSelecc) return;

    this.http
      .patch<PacienteResponse>(
        `${environment.apiUrl}/pacientes/${this.pacienteSelecc.idPaciente}/editar`,
        { telefono: this.telefonoEditar, direccion: this.direccionEditar, email: this.emailEditar },
      )
      .subscribe({
        next: (data) => {
          const index = this.pacientes.findIndex((p) => p.idPaciente === data.idPaciente);
          if (index !== -1) this.pacientes[index] = data;
          this.cerrarModalEditar();
          this.notificacionService.exito('Datos actualizados');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al editar');
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
  // ----------------

  // para ver las citas del paciente
  verCitas(paciente: PacienteResponse): void {
    this.pacienteSelecc = paciente;
    this.mostrarModalCitas = true;
    this.cargandoCitas = true;
    this.pacienteCitas = [];
    this.citaService.obtenerPorPaciente(paciente.idPaciente).subscribe({
      next: (data) => {
        // para mostrar las ultimas 5 ordenes por fecha
        this.pacienteCitas = data
          .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
          .slice(0, 5);
        this.cargandoCitas = false;
      },
      error: () => {
        this.notificacionService.error('Error al cargar citas');
        this.cargandoCitas = false;
      },
    });
  }

  cerrarModalCitas(): void {
    this.mostrarModalCitas = false;
    this.pacienteCitas = [];
  }

  // usamos localStorage para pasar el id entre pantallas
  verHistorial(paciente: PacienteResponse): void {
    localStorage.setItem('historialPacienteId', paciente.idPaciente.toString());
    this.router.navigate(['/historial']);
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

  // ----------------
}
