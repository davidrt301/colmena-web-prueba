import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, NuevaCuenta } from '../../core/auth.service';
import { validarCuenta } from '../../core/validaciones';

@Component({
  imports: [RouterLink],
  selector: 'app-registro',
  // La misma tarjeta del login: una sola hoja de estilos para las dos páginas públicas
  styleUrl: '../login/login.css',
  templateUrl: './registro.html',
})
export class Registro {
  private authService = inject(AuthService);

  error = this.authService.error;
  cargando = this.authService.cargando;
  errores = signal<string[]>([]);

  constructor() {
    this.authService.limpiarError();
  }

  crearCuenta(evento: SubmitEvent) {
    evento.preventDefault();
    const datos = new FormData(evento.target as HTMLFormElement);
    const cuenta: NuevaCuenta = {
      nombre: String(datos.get('nombre') ?? '').trim(),
      email: String(datos.get('email') ?? '').trim(),
      password: String(datos.get('password') ?? '')
    };

    this.errores.set(validarCuenta(cuenta, String(datos.get('confirmacion') ?? '')));
    if (this.errores().length > 0) {
      return;
    }

    this.authService.registrarse(cuenta);
  }
}