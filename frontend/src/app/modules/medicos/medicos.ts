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

  // especialidades que se van a agregar
  especialidadesAgregar: number[] = [];
  // especialidades que se van a quitar
  especialidadesAQuitar: number[] = [];
  // vista temporal de especialidades actuales en el modal
  especialidadesVistaModal: EspecialidadResponse[] = [];

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

  // abrir modal para gestionar espeicialidades del medico
  // abrirModalEspecialidades(medico: MedicoResponse): void {
  //   this.abrirModalEditar(medico);
  // }

  // cerrarModalEspecia(): void {
  //   this.mostrarModalEspecialidades = false;
  // }

  toggleEspecialidadAgregar(idEspecialidad: number): void {
    const index = this.especialidadesAgregar.indexOf(idEspecialidad);
    if (index === -1) {
      // se marca para agregar
      this.especialidadesAgregar = [...this.especialidadesAgregar, idEspecialidad];
    } else {
      // para desmarcar
      this.especialidadesAgregar = this.especialidadesAgregar.filter((id) => id !== idEspecialidad);
    }
  }

  confirmAgregarEspecia(): void {
    if (this.especialidadesAgregar.length === 0) return;
    for (const idEsp of this.especialidadesAgregar) {
      const esp = this.especialidadesDispo.find((e) => e.idEspecialidad === idEsp);
      if (esp) {
        // mover de disponibilidad a vista modal
        this.especialidadesDispo = this.especialidadesDispo.filter(
          (e) => e.idEspecialidad !== idEsp,
        );
        const yaEnVista = this.especialidadesVistaModal.some((e) => e.idEspecialidad === idEsp);
        if (!yaEnVista) {
          this.especialidadesVistaModal = [...this.especialidadesVistaModal, esp];
        }
      }
    }
  }

  agregarEspecia(): void {
    if (!this.medicoSelecc || this.especialidadesAgregar.length === 0) {
      this.notificacionService.error('Selecciona una especialidad');
      return;
    }
    // se crea promesas para cada especialidad seleccionada
    const peticiones = this.especialidadesAgregar.map((idEsp) =>
      this.http.post<any>(`${environment.apiUrl}/medico-especialidad`, {
        idMedico: this.medicoSelecc!.idMedico,
        idEspecialidad: idEsp,
      }),
    );

    Promise.all(peticiones)
      .then(() => {
        this.notificacionService.exito(
          `${this.especialidadesAgregar.length} especialidades(es) agregada(s)`,
        );
        this.especialidadesAgregar = [];

        this.medicoService.obtenerTodos().subscribe({
          next: (medicos) => {
            this.medicos = medicos;
            const actualizado = medicos.find((m) => m.idMedico === this.medicoSelecc!.idMedico);
            if (actualizado) {
              this.medicoSelecc = {
                ...actualizado,
                especialidades: [...(actualizado.especialidades || [])],
              };
              const idsActuales = this.medicoSelecc.especialidades.map((e) => e.idEspecialidad);
              this.especialidadesDispo = this.especialidadesDispo.filter(
                (e) => !idsActuales.includes(e.idEspecialidad),
              );
            }
          },
        });
      })
      .catch(() => {
        this.notificacionService.error('Error al agregar especialidad');
      });
  }

  abrirModalEditar(medico: MedicoResponse): void {
    this.medicoSelecc = { ...medico, especialidades: [...(medico.especialidades || [])] };
    this.telefonoEditar = medico.telefono || '';
    this.especialidadesAQuitar = [];
    this.especialidadesAgregar = [];

    // vista temporal = copia de las actuales
    this.especialidadesVistaModal = [...(medico.especialidades || [])];

    // cargar todas las activas y filtrar las que ya se tiene
    this.especialidadService.obtenerActivas().subscribe({
      next: (todas) => {
        const idsActuales = (medico.especialidades || []).map((e) => e.idEspecialidad);
        this.especialidadesDispo = todas.filter((e) => !idsActuales.includes(e.idEspecialidad));
      },
    });
    this.mostrarModalEditar = true;
  }

  // quitar especialidad de la vista del modal
  quitarEspeciaModal(esp: EspecialidadResponse): void {
    // para agregar a la lista de "quitar"
    if (!this.especialidadesAQuitar.includes(esp.idEspecialidad)) {
      this.especialidadesAQuitar.push(esp.idEspecialidad);
    }
    // en caso este en "agregar" tambien se quita de ahi
    this.especialidadesAgregar = this.especialidadesAgregar.filter(
      (id) => id !== esp.idEspecialidad,
    );

    this.especialidadesVistaModal = this.especialidadesVistaModal.filter(
      (e) => e.idEspecialidad !== esp.idEspecialidad,
    );

    const yaExiste = this.especialidadesDispo.some((e) => e.idEspecialidad === esp.idEspecialidad);
    if (!yaExiste) {
      this.especialidadesDispo = [...this.especialidadesDispo, esp];
    }
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.medicoSelecc = null;
    this.especialidadesAgregar = [];
    this.especialidadesAQuitar = [];
    this.especialidadesVistaModal = [];
  }

  guardarEdicion(): void {
    if (!this.medicoSelecc) return;

    const idMedico = this.medicoSelecc.idMedico;
    // obtener todas las relaciones actuales del medico
    this.http.get<any[]>(`${environment.apiUrl}/medico-especialidad/medico/${idMedico}`).subscribe({
      next: (relaciones) => {
        const promesas: Promise<any>[] = [];

        // desactivar las especialidades a quitar
        for (const idEsp of this.especialidadesAQuitar) {
          const relacion = relaciones.find((r: any) => r.idEspecialidad === idEsp);
          if (relacion) {
            promesas.push(
              this.http
                .patch(`${environment.apiUrl}/medico-especialidad/${relacion.id}/desactivar`, {})
                .toPromise(),
            );
          }
        }

        // agregar las nuevas especialidades
        for (const idEsp of this.especialidadesAgregar) {
          promesas.push(
            this.http
              .post<any>(`${environment.apiUrl}/medico-especialidad`, {
                idMedico,
                idEspecialidad: idEsp,
              })
              .toPromise(),
          );
        }

        // actualizar telefono
        promesas.push(
          this.medicoService
            .editar(idMedico, {
              telefono: this.telefonoEditar,
            })
            .toPromise(),
        );

        // ejecutar todo y actualizar la tabla
        Promise.all(promesas)
          .then(() => {
            this.notificacionService.exito('Medico actualizado correctamente');
            this.cerrarModalEditar();
            this.cargarMedicos();
          })
          .catch(() => {
            this.notificacionService.error('Error al guardar cambios');
          });
      },
      error: () => {
        this.notificacionService.error('Error al obtener relaciones del medico');
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
