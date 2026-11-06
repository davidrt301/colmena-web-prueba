import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api';
import { mensajeDeError } from '../core/errores';

export type TipoEspacio = 'SALA_REUNIONES' | 'OFICINA_PRIVADA' | 'CABINA' | 'AUDITORIO';

export interface Espacio {
  id: number;
  nombre: string;
  tipo: TipoEspacio;
  capacidad: number;
  precioHora: number;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
}

// Lo que envía la administración al crear o editar. El id y el estado los maneja el backend
export interface NuevoEspacio {
  nombre: string;
  tipo: TipoEspacio;
  capacidad: number;
  precioHora: number;
  descripcion: string | null;
  imagenUrl: string | null;
}

// Un horario ocupado de un espacio. No dice quién reservó: eso es privado.
export interface FranjaOcupada {
  horaInicio: string;
  horaFin: string;
}

export const NOMBRE_TIPO: Record<TipoEspacio, string> = {
  SALA_REUNIONES: 'Sala de reuniones',
  OFICINA_PRIVADA: 'Oficina privada',
  CABINA: 'Cabina',
  AUDITORIO: 'Auditorio'
};

@Service()
export class EspaciosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/espacios`;

  private lista = signal<Espacio[]>([]);
  private cargandoSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  espacios = this.lista.asReadonly();
  cargando = this.cargandoSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // GET /api/espacios: el backend decide si devuelve todos o solo los activos
  cargar() {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Espacio[]>(this.apiUrl).subscribe({
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

  // GET /api/espacios/{id}: lo usa la página Reservar
  obtener(id: number): Observable<Espacio> {
    return this.http.get<Espacio>(`${this.apiUrl}/${id}`);
  }

  // GET /api/espacios/{id}/ocupacion?fecha=AAAA-MM-DD: los horarios ya tomados ese día
  ocupacion(id: number, fecha: string): Observable<FranjaOcupada[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<FranjaOcupada[]>(`${this.apiUrl}/${id}/ocupacion`, { params });
  }

  // POST /api/espacios (exige ESPACIOS_GESTIONAR)
  crear(datos: NuevoEspacio): Observable<Espacio> {
    return this.http.post<Espacio>(this.apiUrl, datos);
  }

  // PUT /api/espacios/{id} (exige ESPACIOS_GESTIONAR)
  actualizar(id: number, datos: NuevoEspacio): Observable<Espacio> {
    return this.http.put<Espacio>(`${this.apiUrl}/${id}`, datos);
  }

  // PATCH /api/espacios/{id}/estado (exige ESPACIOS_GESTIONAR)
  cambiarEstado(espacio: Espacio, activo: boolean) {
    this.errorSignal.set(null);

    this.http.patch<Espacio>(`${this.apiUrl}/${espacio.id}/estado`, { activo }).subscribe({
      next: (actualizado) => {
        this.lista.update(actuales =>
          actuales.map(e => (e.id === actualizado.id ? actualizado : e))
        );
      },
      error: (error: HttpErrorResponse) => this.errorSignal.set(mensajeDeError(error))
    });
  }
}