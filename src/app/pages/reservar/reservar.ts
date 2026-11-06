import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { mensajeDeError } from '../../core/errores';
import { pesos } from '../../core/formato';
import { bloquesDelDia, horasEntre, hoyComoTexto, validarReserva } from '../../core/validaciones';
import { Espacio, EspaciosService, FranjaOcupada } from '../../services/espacios.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  imports: [RouterLink],
  selector: 'app-reservar',
  styleUrl: './reservar.css',
  templateUrl: './reservar.html',
})
export class Reservar implements OnInit {
  private espaciosService = inject(EspaciosService);
  private reservasService = inject(ReservasService);
  private router = inject(Router);

  // Llega de la URL /espacios/:id/reservar (withComponentInputBinding)
  id = input.required<string>();

  espacio = signal<Espacio | null>(null);
  errorCarga = signal<string | null>(null);
  ocupadas = signal<FranjaOcupada[]>([]);

  fecha = signal('');
  horaInicio = signal('');
  horaFin = signal('');
  errores = signal<string[]>([]);
  errorServidor = signal<string | null>(null);
  enviando = signal(false);

  bloques = bloquesDelDia();
  hoy = hoyComoTexto();
  pesos = pesos;

  // El resumen que se ve ANTES de enviar. El valor definitivo lo calcula el backend.
  horas = computed(() => horasEntre(this.horaInicio(), this.horaFin()));
  valor = computed(() => Math.round(this.horas() * (this.espacio()?.precioHora ?? 0)));

  ngOnInit() {
    this.espaciosService.obtener(Number(this.id())).subscribe({
      next: (espacio) => this.espacio.set(espacio),
      error: (error: HttpErrorResponse) => this.errorCarga.set(mensajeDeError(error))
    });
  }

  // Cada cambio del formulario actualiza el resumen; si cambió la fecha, trae lo ocupado
  actualizar(evento: Event) {
    const datos = new FormData(evento.currentTarget as HTMLFormElement);
    const fecha = String(datos.get('fecha') ?? '');
    this.horaInicio.set(String(datos.get('horaInicio') ?? ''));
    this.horaFin.set(String(datos.get('horaFin') ?? ''));

    if (fecha !== this.fecha()) {
      this.fecha.set(fecha);
      this.cargarOcupacion(fecha);
    }
  }

  reservar(evento: SubmitEvent) {
    evento.preventDefault();
    const datos = new FormData(evento.target as HTMLFormElement);
    const reserva = {
      espacioId: Number(this.id()),
      fecha: String(datos.get('fecha') ?? ''),
      horaInicio: String(datos.get('horaInicio') ?? ''),
      horaFin: String(datos.get('horaFin') ?? ''),
      asistentes: Number(datos.get('asistentes')),
      nota: String(datos.get('nota') ?? '').trim() || null
    };

    this.errorServidor.set(null);
    this.errores.set(validarReserva(reserva, this.espacio()?.capacidad ?? 0, new Date()));
    if (this.errores().length > 0) {
      return;
    }

    this.enviando.set(true);
    this.reservasService.crear(reserva).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigateByUrl('/mis-reservas');
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorServidor.set(mensajeDeError(error));
        this.cargarOcupacion(reserva.fecha);
      }
    });
  }

  private cargarOcupacion(fecha: string) {
    if (!fecha) {
      this.ocupadas.set([]);
      return;
    }
    this.espaciosService.ocupacion(Number(this.id()), fecha).subscribe({
      next: (franjas) => this.ocupadas.set(franjas),
      error: () => this.ocupadas.set([])
    });
  }
}