const formatoPesos = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
  
  // 45000 -> "$ 45.000"
  export function pesos(valor: number): string {
    return formatoPesos.format(valor);
  }
  
  const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // '2026-10-15T15:24:17' -> "15 de oct de 2026"
  export function fechaCorta(fechaIso: string): string {
    return formatoFecha.format(new Date(fechaIso));
  }