import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { EspecialidadRequest, EspecialidadResponse } from '../../shared/models/especialidad.model';

// @Component define que esta clase sea una pantalla de angular
@Component({
  selector: 'app-especialidades', // nombre para usar este componente en otros HTML
  standalone: true,
  imports: [ // imports = herramientas que esta pantalla necesita |
    CommonModule, FormsModule // FormsModule = [(ngModel)] para enlazar inputs con variables
  ],  
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.css',
})
  
// OnInit señala que al cargar esta pantalla se hara esto primero
export class Especialidades implements OnInit {
  
  // se mostrara una lista en la tabla, que sera vacia pero se llenara cuando el backend responda
  especialidades: EspecialidadResponse[] = []

  // controla si el modal de crear se puede visializar o no
  mostrarModal: boolean = false

  // controla si estamos esperando alguna respuesta del backend, si es asi se mostrara "Cargando..." de lo contrario monstrara los datos
  cargando: boolean = false

  mensaje: string = '';
  esError: boolean = false

  // esto seran los campos del formulario que el usuario llenara, gracias a ngModel los datos se actualizaran automatica.
  nuevaEspecialidad: EspecialidadRequest = {
    nombre: '',
    descripcion: ''
  }

  // Angular inyecta el servicio automáticamente aquí
  constructor(private especialidadService: EspecialidadService) { }
  
  // equivale a "al abrir esta pantalla osea se cargaran las especialidades automaticamente"
  ngOnInit(): void {
      this.cargarEspecialidades()
  }

  cargarEspecialidades(): void {
    this.cargando = true
    // obtenerTodas() hace http://localhost:8080/api/especialidades
    this.especialidadService.obtenerTodas().subscribe({ // subscribe() espera la respuesta del backend
      // next = se ejecuta cuando el backend responde bien
      next: (data) => { // data es el array de especialidades que devuelve el backend 
        this.especialidades = data
        this.cargando = false
      },
      // error = se ejecuta cuando el backend responde con error
      error: (err) => {
        this.mostrarMensaje('Error al cargar especialidades', true)
        this.cargando = false
      },
    })
  }

  // limpia el formulario para que no queden datos de una creación anterior
  abrirModal(): void {
    this.mostrarModal = true
    this.nuevaEspecialidad = {nombre: '', descripcion: ''}
  }

  cerrarModal(): void {
    this.mostrarModal = false
  }

  crearEspecialidad(): void {
    // esta condicion valida si el nombre de especialidad esta lleno antes de enviar al backend
    if (!this.nuevaEspecialidad.nombre.trim()) { //trim. este componente elimina espacios en blanco al inicio y al final
      this.mostrarMensaje('El nombre es obligatorio', true) 
      return // detiene la ejecución si no hay nombre
    }

    // crear() envia el objeto nuevaEspecialidad como body JSON
    this.especialidadService.crear(this.nuevaEspecialidad).subscribe({
      next: (data) => { // data es la especialidad recién creada que devuelve el backend
        this.especialidades.push(data) // push() la agrega al final de la lista sin recargar todo
        this.cerrarModal()
        this.mostrarMensaje('Especialidad creada correctamente', false)
      },
      error: (err) => {
        // err.error.mensaje es el mensaje que devuelve del backend
          this.mostrarMensaje(err.error?.mensaje || 'Error al crear', true)
      }
    })
  }

  desactivarEspecialidad(id: number): void {
    // confirm() muestra un diálogo de confirmación nativo del navegador
    if (!confirm('¿Desactivar esta especialidad?')) return // si el usuario hace clic en Cancelar, return detiene la ejecución

    this.especialidadService.desactivar(id).subscribe({
      next: (data) => {
        // para no recargar toda la lista buscamos el índice del elemento modificado y lo reemplazamos con la versión actualizada 
        const index = this.especialidades.findIndex(e => e.idEspecialidad === id)
        if (index !== -1) {
          this.especialidades[index] = data
        }
        this.mostrarMensaje('Especialidad desactivada', false)
      },
      error: (err) => {
          this.mostrarMensaje(err.error?.mensaje || 'Error', true)
      },
    })
  }
  
  private mostrarMensaje(texto: string, esError: boolean): void{
    this.mensaje = texto
    this.esError = esError
    setTimeout(() => this.mensaje = '', 3000)
  }
}
