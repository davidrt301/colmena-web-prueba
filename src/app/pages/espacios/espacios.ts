import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { pesos } from '../../core/formato';
import { SiPuede } from '../../shared/si-puede';
import { Espacio, EspaciosService, NOMBRE_TIPO, TipoEspacio } from '../../services/espacios.service';

type Filtro = TipoEspacio | 'TODOS';

@Component({
  imports: [SiPuede, RouterLink],
  selector: 'app-espacios',
  styleUrl: './espacios.css',
  templateUrl: './espacios.html',
})
export class Espacios {
  private espaciosService = inject(EspaciosService);
  private authService = inject(AuthService);

  espacios = this.espaciosService.espacios;
  cargando = this.espaciosService.cargando;
  error = this.espaciosService.error;

  nombreTipo = NOMBRE_TIPO;
  pesos = pesos;

  gestiona = computed(() => this.authService.puede('ESPACIOS_GESTIONAR'));
  inactivos = computed(() => this.espacios().filter(e => !e.activo).length);

  filtros: { valor: Filtro; texto: string }[] = [
    { valor: 'TODOS', texto: 'Todos' },
    { valor: 'SALA_REUNIONES', texto: 'Salas' },
    { valor: 'OFICINA_PRIVADA', texto: 'Oficinas' },
    { valor: 'CABINA', texto: 'Cabinas' },
    { valor: 'AUDITORIO', texto: 'Auditorio' }
  ];
  filtro = signal<Filtro>('TODOS');

  espaciosFiltrados = computed(() =>
    this.filtro() === 'TODOS'
      ? this.espacios()
      : this.espacios().filter(e => e.tipo === this.filtro())
  );

  constructor() {
    this.espaciosService.cargar();
  }

  alternarEstado(espacio: Espacio) {
    this.espaciosService.cambiarEstado(espacio, !espacio.activo);
  }
}