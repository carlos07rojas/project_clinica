import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../core/services/medico.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { MedicoRequest, MedicoResponse } from '../../shared/models/medico.model';
import { EspecialidadResponse } from '../../shared/models/especialidad.model';
import { UsuarioResponse } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css',
})
export class Medicos implements OnInit {
  // lista de los medicos que se van a mostrar en la tabla
  medicos: MedicoResponse[] = [];

  // la lista de especialidades que se mostraran en el selector del modal
  especialidades: EspecialidadResponse[] = [];

  // lista de usuario con rol en este caso MEDICOS para el selector del modal
  usuariosMedico: UsuarioResponse[] = [];

  mostrarModal: boolean = false;
  mostrarModalUsuario: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  // objeto para crear un medico
  nuevoMedico: MedicoRequest = {
    idUsuario: 0,
    codigoColegiatura: '',
    idEspecialidad: 0,
    telefono: '',
  };

  // objeto del formulario de crear usuario médico donde primero creamos el usuario, luego el perfil médico
  nuevoUsuarioMedico = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'MEDICO',
  };

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.medicoService.obtenerTodos().subscribe({
      next: (data) => {
        this.medicos = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar médicos', true);
        this.cargando = false;
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoMedico = {
      idUsuario: 0,
      codigoColegiatura: '',
      idEspecialidad: 0,
      telefono: '',
    };

    this.especialidadService.obtenerActivas().subscribe({
      next: (data) => (this.especialidades = data),
    });

    this.usuarioService.obtenerTodo().subscribe({
      next: (data) => {
        this.usuariosMedico = data.filter((u) => u.rol === 'MEDICO');
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  abrirModalUsuario(): void {
    this.mostrarModalUsuario = true;
    this.nuevoUsuarioMedico = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'MEDICO',
    };
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
  }

  crearUsuarioMedico(): void {
    if (
      !this.nuevoUsuarioMedico.nombre.trim() ||
      !this.nuevoUsuarioMedico.email.trim() ||
      !this.nuevoUsuarioMedico.password.trim()
    ) {
      this.mostrarMensaje('Nombre, email y contraseña son obligatorios', true);
      return;
    }

    this.usuarioService.crear(this.nuevoUsuarioMedico).subscribe({
      next: (data) => {
        // se agrega un nuevo usuario a la lista del selector
        this.usuariosMedico.push(data);
        // con eso se selecciona automaticamente
        this.nuevoMedico.idUsuario = data.idUsuario;
        this.cerrarModalUsuario;
        this.mostrarMensaje('Usuario creado. Ahora completa el perfil medico', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear usuario', true);
      },
    });
  }

  crearMedico(): void {
    if (this.nuevoMedico.idUsuario === 0) {
      this.mostrarMensaje('Selecciona un usuario', true);
      return;
    }

    if (!this.nuevoMedico.codigoColegiatura.trim()) {
      this.mostrarMensaje('El codigo de colegiatura es obligatorio', true);
      return;
    }

    if (this.nuevoMedico.idEspecialidad === 0) {
      this.mostrarMensaje('Selecciona una especialidad', true);
      return;
    }

    this.medicoService.crear(this.nuevoMedico).subscribe({
      next: (data) => {
        this.medicos.push(data);
        this.cerrarModal();
        this.mostrarMensaje('Medico registrado correctamente', false);
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear medico', true);
      },
    });
  }

  private mostrarMensaje(texto: string, esError: boolean): void {
    this.mensaje = texto;
    this.esError = esError;
    setTimeout(() => (this.mensaje = ''), 4000);
  }
}
