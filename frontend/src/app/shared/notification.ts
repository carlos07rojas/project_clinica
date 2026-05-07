import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService, Notificacion } from '../core/services/notificacion.service';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit {
  // lista de notificaciones activas
  notificacion: Notificacion[] = [];

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.notificacionService.notificacion$.subscribe((data) => (this.notificacion = data));
  }

}
