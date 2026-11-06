// Las MISMAS reglas que el backend (ReservaServiceImpl), para avisar ANTES de enviar.
// El frontend orienta; el backend protege: estas reglas no reemplazan las del servidor.

import { NuevaCuenta } from './auth.service';

export const APERTURA = '07:00';
export const CIERRE = '21:00';

export interface DatosReserva {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
}

// '09:30' -> 570 (minutos desde la medianoche)
function minutos(hora: string): number {
  const [horas, mins] = hora.split(':').map(Number);
  return horas * 60 + mins;
}

// La fecha de hoy en el computador de quien usa la app, como 'AAAA-MM-DD'
export function hoyComoTexto(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Los bloques de media hora del horario: ['07:00', '07:30', ..., '21:00']
export function bloquesDelDia(): string[] {
  const bloques: string[] = [];
  for (let m = minutos(APERTURA); m <= minutos(CIERRE); m += 30) {
    const horas = String(Math.floor(m / 60)).padStart(2, '0');
    bloques.push(`${horas}:${m % 60 === 0 ? '00' : '30'}`);
  }
  return bloques;
}

// Horas entre dos bloques: '09:00' a '10:30' -> 1.5. 0 si falta una hora o están invertidas.
export function horasEntre(horaInicio: string, horaFin: string): number {
  if (!horaInicio || !horaFin) {
    return 0;
  }
  const horas = (minutos(horaFin) - minutos(horaInicio)) / 60;
  return horas > 0 ? horas : 0;
}

// Devuelve la lista de errores. Lista vacía = se puede enviar.
export function validarReserva(datos: DatosReserva, capacidad: number, ahora: Date): string[] {
  const errores: string[] = [];

  if (!datos.fecha) {
    errores.push('Escoge la fecha');
  }
  if (!datos.horaInicio) {
    errores.push('Escoge la hora de inicio');
  }
  if (!datos.horaFin) {
    errores.push('Escoge la hora de fin');
  }
  if (errores.length > 0) {
    return errores;
  }

  if (minutos(datos.horaFin) <= minutos(datos.horaInicio)) {
    errores.push('La hora de fin debe ser posterior a la hora de inicio');
  }
  if (minutos(datos.horaInicio) < minutos(APERTURA) || minutos(datos.horaFin) > minutos(CIERRE)) {
    errores.push('El coworking abre de 7:00 a. m. a 9:00 p. m.');
  }
  if (minutos(datos.horaInicio) % 30 !== 0 || minutos(datos.horaFin) % 30 !== 0) {
    errores.push('Las reservas se hacen en bloques de 30 minutos (ej: 9:00 o 9:30)');
  }
  // 'AAAA-MM-DDTHH:mm' sin zona horaria se lee como hora local del computador
  if (new Date(`${datos.fecha}T${datos.horaInicio}`) < ahora) {
    errores.push('No puedes reservar en una fecha u hora que ya pasó');
  }
  if (!(datos.asistentes >= 1)) {
    errores.push('Debe asistir al menos 1 persona');
  } else if (datos.asistentes > capacidad) {
    errores.push(`Este espacio admite máximo ${capacidad} ${capacidad === 1 ? 'persona' : 'personas'}`);
  }

  return errores;
}

// Las reglas de RegistroRequest del backend, con sus mismos mensajes,
// más una que solo existe en pantalla: escribir dos veces la contraseña
export function validarCuenta(cuenta: NuevaCuenta, confirmacion: string): string[] {
  const errores: string[] = [];

  if (!cuenta.nombre) {
    errores.push('El nombre es obligatorio');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cuenta.email)) {
    errores.push('El email no tiene un formato válido');
  }
  if (cuenta.password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (cuenta.password !== confirmacion) {
    errores.push('Las contraseñas no coinciden');
  }

  return errores;
}