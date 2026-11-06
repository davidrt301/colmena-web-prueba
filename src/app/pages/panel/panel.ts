import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from '../../core/errores';
import { pesos } from '../../core/formato';
import { Resumen, ReportesService } from '../../services/reportes.service';

@Component({
  imports: [],
  selector: 'app-panel',
  styleUrl: './panel.css',
  templateUrl: './panel.html',
})
export class Panel {
  private reportesService = inject(ReportesService);

  resumen = signal<Resumen | null>(null);
  error = signal<string | null>(null);

  pesos = pesos;
  mes = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date());

  // El espacio con más horas llena la barra; los demás se miden contra él
  maximoHoras = computed(() => {
    const horas = this.resumen()?.ocupacionMes.map(o => o.horasReservadas) ?? [];
    return Math.max(1, ...horas);
  });

  constructor() {
    this.reportesService.resumen().subscribe({
      next: (datos) => this.resumen.set(datos),
      error: (error: HttpErrorResponse) => this.error.set(mensajeDeError(error))
    });
  }

  // 6 horas cuando el máximo es 8 -> 75 (por ciento del ancho)
  ancho(horas: number): number {
    return Math.round((horas / this.maximoHoras()) * 100);
  }
}