// gaelruiz9024/tc2007b_0fraud_dashboard/src/lib/types.ts
export interface UserProfile {
  id: string;
  correo: string;
  nombre: string;
  idRol: number; // 1 para Admin, 2 para User
}

export interface Report {
  id: number;
  idUsuario: number;
  titulo: string;
  descripcion: string;
  urlPagina: string;
  fechaCreacion: string;
  estado: string; // 'Pendiente', 'Aprobado', 'Rechazado'
  idAdmin: number | null;
  fechaRevision: string | null;
  idCategoria: number | null;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: 0 | 1;
}

export interface User { 
  id: number;
  correo: string;
  nombre: string;
  idRol: number;
  activo: 0 | 1; 
}

export interface ReportsByCategory {
  categoryName: string;
  reportCount: number;
}

export interface StatusPecentage {
  status: string;
  percentage: number;
  count: number;
}

export type HistoricalReportData = {
    date: string; 
    categoryName: string;
    reportCount: number;
}