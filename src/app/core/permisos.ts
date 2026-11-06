// Los mismos nombres que el enum Rol y el enum Permiso del backend
export type Rol = 'ADMIN' | 'USER';

export type Permiso =
  | 'ESPACIOS_VER'
  | 'ESPACIOS_GESTIONAR'
  | 'RESERVAS_CREAR'
  | 'RESERVAS_VER_PROPIAS'
  | 'RESERVAS_CANCELAR_PROPIAS'
  | 'RESERVAS_VER_TODAS'
  | 'RESERVAS_CANCELAR_TODAS'
  | 'USUARIOS_GESTIONAR'
  | 'REPORTES_VER';

// Cómo se muestran en pantalla
export const NOMBRE_ROL: Record<Rol, string> = {
  ADMIN: 'Administración',
  USER: 'Miembro'
};

export const DESCRIPCION_PERMISO: Record<Permiso, string> = {
  ESPACIOS_VER: 'Ver espacios',
  ESPACIOS_GESTIONAR: 'Gestionar espacios',
  RESERVAS_CREAR: 'Reservar',
  RESERVAS_VER_PROPIAS: 'Ver mis reservas',
  RESERVAS_CANCELAR_PROPIAS: 'Cancelar mis reservas',
  RESERVAS_VER_TODAS: 'Ver todas las reservas',
  RESERVAS_CANCELAR_TODAS: 'Cancelar cualquier reserva',
  USUARIOS_GESTIONAR: 'Gestionar miembros',
  REPORTES_VER: 'Ver reportes'
};