import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { MedicoService } from '../../core/services/medico.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { MedicoRequest, MedicoResponse } from '../../shared/models/medico.model';
import { EspecialidadResponse } from '../../shared/models/especialidad.model';
import { UsuarioResponse } from '../../shared/models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconsModule],
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
  mostrarModalEditar: boolean = false;
  mostrarModalEspecialidades: boolean = false;

  // medico seleccionado para editar
  medicoSelecc: MedicoResponse | null = null;

  // datos de edicion
  telefonoEditar: string = '';

  // especialdiad disponible para asignar al medico seleccionado
  especialidadesDispo: EspecialidadResponse[] = [];
  especialidadAgregar: number = 0;

  // objeto para crear un medico
  nuevoMedico: MedicoRequest = {
    idUsuario: 0,
    codigoColegiatura: '',
    idEspecialidades: [],
    telefono: '',
  };

  especialidadesSelecc: number[] = [];

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
    private notificacionService: NotificacionService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.medicoService.obtenerTodos().subscribe({
      next: (data) => (this.medicos = data),
      error: () => this.notificacionService.error('Error al cargar medicos'),
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoMedico = {
      idUsuario: 0,
      codigoColegiatura: '',
      idEspecialidades: [],
      telefono: '',
    };

    this.especialidadesSelecc = [];

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
    this.especialidadesSelecc = [];
    this.nuevoMedico = {
      idUsuario: 0,
      codigoColegiatura: '',
      idEspecialidades: [],
      telefono: '',
    };
  }

  toggleEspecialidad(idEspecialidad: number): void {
    const index = this.especialidadesSelecc.indexOf(idEspecialidad);
    if (index === -1) {
      this.especialidadesSelecc.push(idEspecialidad);
    } else {
      this.especialidadesSelecc.splice(index, 1);
    }
    this.nuevoMedico.idEspecialidades = this.especialidadesSelecc;
  }

  estaSeleccionada(idEspecialidad: number): boolean {
    return this.especialidadesSelecc.includes(idEspecialidad);
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
      this.notificacionService.error('Nombre, email y contraseña son obligatorios');
      return;
    }
    if (this.nuevoUsuarioMedico.password.length < 8) {
      this.notificacionService.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.usuarioService.crear(this.nuevoUsuarioMedico).subscribe({
      next: (data) => {
        // se agrega un nuevo usuario a la lista del selector
        this.usuariosMedico.push(data);
        // con eso se selecciona automaticamente
        this.nuevoMedico.idUsuario = data.idUsuario;
        this.cerrarModalUsuario();
        this.notificacionService.exito('Usuario creado. Ahora completa el perfil medico');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al crear usuario');
      },
    });
  }

  crearMedico(): void {
    // asignar explicitamente
    this.nuevoMedico.idEspecialidades = [...this.especialidadesSelecc];

    if (this.nuevoMedico.idUsuario === 0) {
      this.notificacionService.error('Selecciona un usuario');
      return;
    }

    if (!this.nuevoMedico.codigoColegiatura.trim()) {
      this.notificacionService.error('El codigo de colegiatura es obligatorio');
      return;
    }

    if (this.nuevoMedico.codigoColegiatura.length > 10) {
      this.notificacionService.error('El codigo no puede exceder 10 caracteres');
      return;
    }

    // agregar este log temporal para verificar
    this.nuevoMedico.idEspecialidades = [...this.especialidadesSelecc];

    console.log('Enviando', JSON.stringify(this.nuevoMedico));

    this.medicoService.crear(this.nuevoMedico).subscribe({
      next: (data) => {
        this.medicos.push(data);
        this.cerrarModal();
        this.notificacionService.exito('Medico registrado correctamente');
      },
      error: (err) => {
        this.notificacionService.error(err.error?.mensaje || 'Error al crear medico');
      },
    });

    // validar que el teléfono sea solo números si fue ingresado
    if (this.nuevoMedico.telefono && !/^\d{9}$/.test(this.nuevoMedico.telefono)) {
      this.notificacionService.error('El teléfono debe tener exactamente 9 dígitos numéricos');
      return;
    }
  }

  abrirModalEditar(medico: MedicoResponse): void {
    this.medicoSelecc = { ...medico, especialidades: [...(medico.especialidades || [])] };
    this.telefonoEditar = medico.telefono || '';

    this.especialidadService.obtenerActivas().subscribe({
      next: (todas) => {
        const idsActuales = (medico.especialidades || []).map((e) => e.idEspecialidad);
        this.especialidadesDispo = todas.filter((e) => !idsActuales.includes(e.idEspecialidad));
      },
    });
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.medicoSelecc = null;
  }

  guardarEdicion(): void {
    if (!this.medicoSelecc) return;

    this.medicoService
      .editar(this.medicoSelecc.idMedico, { telefono: this.telefonoEditar })
      .subscribe({
        next: (data) => {
          const index = this.medicos.findIndex((m) => m.idMedico === data.idMedico);
          if (index !== -1) this.medicos[index] = data;
          this.cerrarModalEditar();
          this.notificacionService.exito('Datos actualizados');
          this.cargarMedicos();
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al editar');
        },
      });
  }

  // abrir modal para gestionar espeicialidades del medico
  abrirModalEspecialidades(medico: MedicoResponse): void {
    this.abrirModalEditar(medico);
  }

  cerrarModalEspecia(): void {
    this.mostrarModalEspecialidades = false;
  }

  agregarEspecia(): void {
    if (!this.medicoSelecc || this.especialidadAgregar === 0) {
      this.notificacionService.error('Selecciona una especialidad');
      return;
    }

    this.http
      .post<any>(`${environment.apiUrl}/medico-especialidad`, {
        idMedico: this.medicoSelecc.idMedico,
        idEspecialidad: this.especialidadAgregar,
      })
      .subscribe({
        next: (data) => {
          // se recargara medicos para ver la especialidad nueva
          this.notificacionService.exito('Especialidad agregada');
          this.especialidadAgregar = 0;

          // recarga los datos del medico seleccionado
          this.medicoService.obtenerTodos().subscribe({
            next: (medicos) => {
              const actualizado = medicos.find((m) => m.idMedico === this.medicoSelecc!.idMedico);
              if (actualizado) {
                // actualizar los medicos selccionados con los nuevos datos
                this.medicoSelecc = {
                  ...actualizado,
                  especialidades: [...(actualizado.especialidades || [])],
                };
                // recalcular las especialidades disponibles
                const idsActuales = this.medicoSelecc.especialidades.map((e) => e.idEspecialidad);
                this.especialidadesDispo = this.especialidadesDispo.filter(
                  (e) => !idsActuales.includes(e.idEspecialidad),
                );
                this.medicos = medicos;
              }
            },
          });
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al agregar especialidad');
        },
      });
  }

  quitarEspecia(idRelacion: number): void {
    if (!confirm('¿Quitar esta especialidad del medico?')) return;

    this.http
      .patch(`${environment.apiUrl}/medico-especialidad/${idRelacion}/desactivar`, {})
      .subscribe({
        next: () => {
          this.cargarMedicos();
          this.notificacionService.exito('Especialidad removida');
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al quitar especialdiad');
        },
      });
  }

  agregarEspecialidadDesdeEditar(): void {
    if (!this.medicoSelecc || this.especialidadAgregar === 0) {
      this.notificacionService.error('Selecciona una especialidad');
      return;
    }

    this.http
      .post<any>(`${environment.apiUrl}/medico-especialidad`, {
        idMedico: this.medicoSelecc.idMedico,
        idEspecialidad: this.especialidadAgregar,
      })
      .subscribe({
        next: () => {
          this.especialidadAgregar = 0;
          this.notificacionService.exito('Especialidad agregada');
          // recargar médicos para ver el cambio
          this.cargarMedicos();
          // actualizar el médico seleccionado
          this.medicoService.obtenerTodos().subscribe({
            next: (data) => {
              const actualizado = data.find((m) => m.idMedico === this.medicoSelecc!.idMedico);
              if (actualizado) this.medicoSelecc = actualizado;
            },
          });
        },
        error: (err) => {
          this.notificacionService.error(err.error?.mensaje || 'Error al agregar especialidad');
        },
      });
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // private mostrarMensaje(texto: string, esError: boolean): void {
  //   if (esError) {
  //     this.notificacionService.error(texto);
  //   } else {
  //     this.notificacionService.exito(texto);
  //   }
  // }
}
