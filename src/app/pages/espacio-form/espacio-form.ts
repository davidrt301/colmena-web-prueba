import { Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { mensajeDeError } from '../../core/errores';
import { Espacio, EspaciosService, NOMBRE_TIPO, NuevoEspacio, TipoEspacio } from '../../services/espacios.service';

@Component({
  imports: [RouterLink],
  selector: 'app-espacio-form',
  styleUrl: './espacio-form.css',
  templateUrl: './espacio-form.html',
})
export class EspacioForm implements OnInit {
  private espaciosService = inject(EspaciosService);
  private router = inject(Router);

  // /espacios/nuevo no trae id; /espacios/:id/editar sí
  id = input<string>();

  espacio = signal<Espacio | null>(null);
  errorServidor = signal<string | null>(null);
  enviando = signal(false);

  tipos = Object.entries(NOMBRE_TIPO) as [TipoEspacio, string][];

  ngOnInit() {
    const id = this.id();
    if (id) {
      this.espaciosService.obtener(Number(id)).subscribe({
        next: (espacio) => this.espacio.set(espacio),
        error: (error: HttpErrorResponse) => this.errorServidor.set(mensajeDeError(error))
      });
    }
  }

  guardar(evento: SubmitEvent) {
    evento.preventDefault();
    const datos = new FormData(evento.target as HTMLFormElement);
    const espacio: NuevoEspacio = {
      nombre: String(datos.get('nombre') ?? '').trim(),
      tipo: String(datos.get('tipo')) as TipoEspacio,
      capacidad: Number(datos.get('capacidad')),
      precioHora: Number(datos.get('precioHora')),
      descripcion: String(datos.get('descripcion') ?? '').trim() || null,
      imagenUrl: String(datos.get('imagenUrl') ?? '').trim() || null
    };

    const id = this.id();
    const peticion = id
      ? this.espaciosService.actualizar(Number(id), espacio)
      : this.espaciosService.crear(espacio);

    this.errorServidor.set(null);
    this.enviando.set(true);
    peticion.subscribe({
      next: () => this.router.navigateByUrl('/espacios'),
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      }
    });
  }
}