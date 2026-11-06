import { Component, inject, signal } from '@angular/core';
import { pesos } from '../../core/formato';
import { hoyComoTexto } from '../../core/validaciones';
import { Reserva, ReservasService, sePuedeCancelar } from '../../services/reservas.service';

@Component({
  imports: [],
  selector: 'app-agenda',
  styleUrl: './agenda.css',
  templateUrl: './agenda.html',
})
export class Agenda {
  private reservasService = inject(ReservasService);

  reservas = this.reservasService.reservas;
  cargando = this.reservasService.cargando;
  error = this.reservasService.error;

  pesos = pesos;

  // La agenda abre en el día de hoy
  fecha = signal(hoyComoTexto());
  porConfirmar = signal<number | null>(null);

  constructor() {
    this.reservasService.cargarDelDia(this.fecha());
  }

  cambiarFecha(evento: Event) {
    const fecha = (evento.target as HTMLInputElement).value;
    if (fecha) {
      this.fecha.set(fecha);
      this.reservasService.cargarDelDia(fecha);
    }
  }

  sePuedeCancelar(reserva: Reserva): boolean {
    return sePuedeCancelar(reserva, new Date());
  }

  confirmarCancelacion(reserva: Reserva) {
    this.reservasService.cancelar(reserva);
    this.porConfirmar.set(null);
  }
}