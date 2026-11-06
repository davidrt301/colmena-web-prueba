import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { permisoGuard } from './core/permiso-guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Colmena',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Colmena',
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro)
  },
  {
    path: 'panel',
    title: 'Panel · Colmena',
    canActivate: [authGuard, permisoGuard('REPORTES_VER')],
    loadComponent: () => import('./pages/panel/panel').then(m => m.Panel)
  },
  {
    path: 'espacios',
    title: 'Espacios · Colmena',
    canActivate: [authGuard, permisoGuard('ESPACIOS_VER')],
    loadComponent: () => import('./pages/espacios/espacios').then(m => m.Espacios)
  },
  {
    path: 'espacios/nuevo',
    title: 'Nuevo espacio · Colmena',
    canActivate: [authGuard, permisoGuard('ESPACIOS_GESTIONAR')],
    loadComponent: () => import('./pages/espacio-form/espacio-form').then(m => m.EspacioForm)
  },
  {
    path: 'espacios/:id/editar',
    title: 'Editar espacio · Colmena',
    canActivate: [authGuard, permisoGuard('ESPACIOS_GESTIONAR')],
    loadComponent: () => import('./pages/espacio-form/espacio-form').then(m => m.EspacioForm)
  },
  {
    path: 'espacios/:id/reservar',
    title: 'Reservar · Colmena',
    canActivate: [authGuard, permisoGuard('RESERVAS_CREAR')],
    loadComponent: () => import('./pages/reservar/reservar').then(m => m.Reservar)
  },
  {
    path: 'mis-reservas',
    title: 'Mis reservas · Colmena',
    canActivate: [authGuard, permisoGuard('RESERVAS_VER_PROPIAS')],
    loadComponent: () => import('./pages/mis-reservas/mis-reservas').then(m => m.MisReservas)
  },
  {
    path: 'agenda',
    title: 'Agenda · Colmena',
    canActivate: [authGuard, permisoGuard('RESERVAS_VER_TODAS')],
    loadComponent: () => import('./pages/agenda/agenda').then(m => m.Agenda)
  },
  {
    path: 'miembros',
    title: 'Miembros · Colmena',
    canActivate: [authGuard, permisoGuard('USUARIOS_GESTIONAR')],
    loadComponent: () => import('./pages/miembros/miembros').then(m => m.Miembros)
  },
  {
    path: 'sin-acceso',
    title: 'Sin acceso · Colmena',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/sin-acceso/sin-acceso').then(m => m.SinAcceso)
  },
  { path: '', pathMatch: 'full', redirectTo: 'espacios' },
  { path: '**', redirectTo: 'espacios' }
];