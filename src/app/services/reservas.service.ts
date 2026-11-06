import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api';
import { mensajeDeError } from '../core/errores';
import { TipoEspacio } from './espacios.service';

export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA';

export interface Reserva {
  id: number;
  espacioId: number;
  espacioNombre: string;
  espacioTipo: TipoEspacio;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  nota: string | null;
  valorTotal: number;
  estado: EstadoReserva;
  creadaEn: string;
}

// Lo único que envía el miembro: quién reserva, el valor y el estado los decide el backend
export interface NuevaReserva {
  espacioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  nota: string | null;
}

// La regla de cancelación en un solo lugar: solo lo CONFIRMADO que todavía no empieza.
// La usan Mis reservas y la Agenda; el backend la vuelve a verificar (409).
export function sePuedeCancelar(reserva: Reserva, ahora: Date): boolean {
  return reserva.estado === 'CONFIRMADA' && new Date(`${reserva.fecha}T${reserva.horaInicio}`) > ahora;
}

@Service()
export class ReservasService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/reservas`;

  private lista = signal<Reserva[]>([]);
  private cargandoSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  reservas = this.lista.asReadonly();
  cargando = this.cargandoSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // POST /api/reservas: devuelve el Observable para que la página decida qué hacer
  crear(datos: NuevaReserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, datos);
  }

  // GET /api/reservas/mias: el backend sabe quién es por el token
  cargarMias() {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Reserva[]>(`${this.apiUrl}/mias`).subscribe({
      next: (datos) => {
        this.lista.set(datos);
        this.cargandoSignal.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorSignal.set(mensajeDeError(error));
        this.cargandoSignal.set(false);
      }
    });
  }

  // GET /api/reservas?fecha=AAAA-MM-DD (exige RESERVAS_VER_TODAS): la agenda de un día
  cargarDelDia(fecha: string) {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);
    const params = new HttpParams().set('fecha', fecha);

    this.http.get<Reserva[]>(this.apiUrl, { params }).subscribe({
      next: (datos) => {
        this.lista.set(datos);
        this.cargandoSignal.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorSignal.set(mensajeDeError(error));
        this.cargandoSignal.set(false);
      }
    });
  }

  // PATCH /api/reservas/{id}/cancelar
  cancelar(reserva: Reserva) {
    this.errorSignal.set(null);

    this.http.patch<Reserva>(`${this.apiUrl}/${reserva.id}/cancelar`, {}).subscribe({
      next: (actualizada) => {
        this.lista.update(actuales =>
          actuales.map(r => (r.id === actualizada.id ? actualizada : r))
        );
      },
      error: (error: HttpErrorResponse) => this.errorSignal.set(mensajeDeError(error))
    });
  }
}