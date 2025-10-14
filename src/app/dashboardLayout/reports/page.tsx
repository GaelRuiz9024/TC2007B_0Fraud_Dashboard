// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/reports/page.tsx
'use client';
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './reports.module.css';
import { api } from '@/lib/api';
import { Report } from '@/lib/types'; 

// Opciones de estado para el select
const REPORT_STATUSES = ['Pendiente', 'Aprobado', 'Rechazado'];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🚨 LLAMADA A LA API
      const response = await api.get('/reports/admin/all-reports'); 
      setReports(response.data);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError('Error al cargar reportes. Verifique el backend y los permisos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado del reporte #${reportId} a: ${newStatus}?`)) {
        return;
    }

    try {
      // 🚨 LLAMADA A LA API
      await api.put(`/reports/admin/update-status/${reportId}`, { estado: newStatus }); 
      
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, estado: newStatus }
            : report
        )
      );
      alert(`Reporte #${reportId} actualizado a: ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating report status:', err);
      alert(`Error al actualizar el reporte #${reportId}: ${err.response?.data?.message || 'Error de conexión'}`);
    }
  };

  if (isLoading) {
    return <div className={styles.pageContainer}><p>Cargando reportes...</p></div>;
  }

  if (error) {
    return <div className={styles.pageContainer}><p style={{ color: 'var(--color-red-error)' }}>Error: {error}</p></div>;
  }
  
  const reportsToDisplay = reports || [];

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Reportes Pendientes</h1>

      {/* Filtros de Búsqueda (CÓDIGO ESTÁTICO) */}
      <div className={styles.filtersContainer}>
        {/* Filtro (Id) */}
        <div className={styles.filterInputContainer}>
          <input type="text" placeholder="Id" className={styles.filterInput}/>
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>
        
        {/* Filtro (Categoría) */}
        <div className={styles.filterInputContainer}>
          <input type="text" placeholder="Categoría" className={styles.filterInput}/>
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>
        
        {/* Filtro (Url) */}
        <div className={styles.filterInputContainer}>
          <input type="text" placeholder="Url" className={styles.filterInput}/>
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>
      </div>

      {/* Tabla de Reportes */}
      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Lista de Reportes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className={styles.tableHeader}>
            <tr>
              {['ID', 'Usuario/URL', 'Descripción', 'Estado Actual', 'Acción'].map((header) => (
                <th key={header} className={styles.tableHeaderCell}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportsToDisplay.length > 0 ? (
                reportsToDisplay.map((report) => (
                <tr key={report.id} className={styles.tableRow}>
                    <td className={`${styles.tableDataCell} ${styles.dataPrimary}`} style={{ fontWeight: 600 }}>#{report.id}</td>
                    <td className={`${styles.tableDataCell} ${styles.dataPrimary}`}>
                        <div style={{ fontWeight: 600 }}>ID Usuario: {report.idUsuario}</div>
                        <div style={{ color: 'var(--color-primary-blue)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{report.urlPagina}</div>
                    </td>
                    <td className={`${styles.tableDataCell} ${styles.dataSecondary}`} style={{ maxWidth: 300, whiteSpace: 'normal' }}>
                        {report.descripcion}
                    </td>
                    <td className={`${styles.tableDataCell} ${styles.dataSecondary}`}>
                        {report.estado}
                    </td>
                    <td className={styles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                        <select 
                            defaultValue={report.estado}
                            onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                        >
                            {REPORT_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </td>
                </tr>
                ))
            ) : (
                <tr className={styles.tableRow}>
                    <td colSpan={5} className={styles.tableDataCell}>No hay reportes para revisar.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}