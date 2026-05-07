import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PacienteRequest, PacienteResponse } from '../../shared/models/paciente.model';
import { UsuarioResponse } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  cargando: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  // texto para filtrar por nombre, que se usa para una busqueda local en tiempo real
  textoBusqueda: string = '';

  // esto permitira buscar directamente en el backend con el DNI
  dniBusqueda: string = '';

  // se mostrar cuando el paciente se haya encontrado
  pacienteEncontrado: PacienteResponse | null = null;

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
    private notificacionService: NotificacionService,
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

  private mostrarMensaje(texto: string, esError: boolean): void {
    if (esError) {
      this.notificacionService.error(texto);
    } else {
      this.notificacionService.exito(texto)
    }
  }
}
