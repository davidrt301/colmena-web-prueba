import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { fechaCorta } from '../../core/formato';
import { NOMBRE_ROL } from '../../core/permisos';
import { Usuario, UsuariosService } from '../../services/usuarios.service';

@Component({
  imports: [],
  selector: 'app-miembros',
  styleUrl: './miembros.css',
  templateUrl: './miembros.html',
})
export class Miembros {
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);

  usuarios = this.usuariosService.usuarios;
  cargando = this.usuariosService.cargando;
  error = this.usuariosService.error;

  nombreRol = NOMBRE_ROL;
  fechaCorta = fechaCorta;

  activos = computed(() => this.usuarios().filter(u => u.activo).length);
  administradores = computed(() => this.usuarios().filter(u => u.rol === 'ADMIN').length);

  constructor() {
    this.usuariosService.cargar();
  }

  // Nadie se desactiva a sí mismo: el backend también lo impide (409)
  esYo(usuario: Usuario): boolean {
    return usuario.email === this.authService.email();
  }

  alternarEstado(usuario: Usuario) {
    this.usuariosService.cambiarEstado(usuario, !usuario.activo);
  }
}