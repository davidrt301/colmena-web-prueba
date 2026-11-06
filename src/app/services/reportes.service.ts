import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api';

// Una fila de la ocupación del mes, tal como la calcula el backend
export interface OcupacionEspacio {
  espacio: string;
  horasReservadas: number;
  ingresos: number;
}

// El resumen del mes en curso: Angular lo muestra, no lo calcula
export interface Resumen {
  reservasHoy: number;
  reservasMes: number;
  ingresosMes: number;
  miembrosActivos: number;
  espaciosActivos: number;
  ocupacionMes: OcupacionEspacio[];
}

@Service()
export class ReportesService {
  private http = inject(HttpClient);

  // GET /api/reportes/resumen (exige REPORTES_VER)
  resumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${API_URL}/reportes/resumen`);
  }
}