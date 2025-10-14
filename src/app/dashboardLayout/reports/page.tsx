// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/reports/page.tsx
'use client';
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './reports.module.css';
import { api } from '@/lib/api';
import { Report } from '@/lib/types'; 
// 👈 Importar el componente Switch
import SwitchComponent from '@/components/switch/Switch'; 

const REPORT_STATUSES = ['Pendiente', 'Aprobado', 'Rechazado'];

// Definición de la estructura de filtros
interface ReportFilters {
    id: string;
    categoria: string;
    url: string;
    // 👈 NUEVO FILTRO
    showAllStatuses: boolean; 
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({ 
      id: '', 
      categoria: '', 
      url: '',
      // 👈 Inicializado en false: mostrar solo Pendientes (default)
      showAllStatuses: false, 
  }); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/reports/admin/all-reports'); 
      setReports(response.data);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError('Error al cargar reportes. Verifique la conexión con el backend.'); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Manejador genérico para inputs de texto
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejador para el Switch
  const handleStatusSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, showAllStatuses: e.target.checked }));
  };
  
  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado del reporte #${reportId} a: ${newStatus}?`)) {
        return;
    }

    try {
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

  // 👈 LÓGICA DE FILTRADO COMPLETA
  const filteredReports = reports.filter(report => {
    // 1. Filtrar por ESTADO (Switch: si showAllStatuses es false, solo mostramos 'Pendiente')
    if (!filters.showAllStatuses && report.estado !== 'Pendiente') {
        return false;
    }
    
    // 2. Filtrar por ID, URL, y Categoría (inputs de texto)
    const searchId = filters.id.toLowerCase();
    const searchUrl = filters.url.toLowerCase();
    const searchCategory = filters.categoria.toLowerCase();

    if (searchId && !String(report.id).includes(searchId)) {
        return false;
    }

    if (searchUrl && !report.urlPagina.toLowerCase().includes(searchUrl)) {
        return false;
    }

    // Se asume que el usuario buscará por ID de categoría si usa este campo.
    if (searchCategory && report.idCategoria && !String(report.idCategoria).includes(searchCategory)) {
        return false;
    }

    return true;
  });

  if (isLoading) {
    return <div className={styles.pageContainer}><p>Cargando reportes...</p></div>;
  }

  if (error) {
    return <div className={styles.pageContainer}><p style={{ color: 'var(--color-red-error)' }}>Error: {error}</p></div>;
  }
  
  const reportsToDisplay = filteredReports || [];

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Reportes Pendientes</h1>

      {/* Filtros de Búsqueda */}
      <div className={styles.filtersContainer}>
        
        {/* Filtro (Id) */}
        <div className={styles.filterInputContainer}>
          <input 
            type="text" 
            placeholder="Id" 
            name="id"
            value={filters.id}
            onChange={handleFilterChange}
            className={styles.filterInput}
          />
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>
        
        {/* Filtro (Categoría) - Muestra el ID de Categoría */}
        <div className={styles.filterInputContainer}>
          <input 
            type="text" 
            placeholder="ID Categoría" 
            name="categoria"
            value={filters.categoria}
            onChange={handleFilterChange}
            className={styles.filterInput}
          />
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>
        
        {/* Filtro (Url) */}
        <div className={styles.filterInputContainer}>
          <input 
            type="text" 
            placeholder="Url" 
            name="url"
            value={filters.url}
            onChange={handleFilterChange}
            className={styles.filterInput}
          />
          <Image src="/globe.svg" alt="Search" width={16} height={16} className={styles.filterIcon + ' invert'}/>
        </div>

        {/* 👈 NUEVO FILTRO: Switch de Estado */}
        <div className={styles.filterSwitchContainer}>
            {filters.showAllStatuses ? 'Mostrando Todos' : 'Pendientes Solamente'}
            <SwitchComponent
                name="showAllStatuses"
                checked={filters.showAllStatuses}
                onChange={handleStatusSwitchChange}
            />
        </div>
      </div>

      {/* Tabla de Reportes */}
      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Lista de Reportes</h2>
        
        {/* 👈 CONTENEDOR SCROLLABLE */}
        <div className={styles.tableWrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className={styles.tableHeader}>
                    {/* Se aplica la clase de sticky header para que se mantenga visible */}
                    <tr className={styles.stickyHeader}> 
                    {['ID', 'ID Usuario/URL', 'ID Categoría', 'Descripción', 'Estado Actual', 'Acción'].map((header) => (
                        <th key={header} className={styles.tableHeaderCell}>{header}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {reportsToDisplay.length > 0 ? (
                        reportsToDisplay.map((report) => (
                        // Corrección de hidratación ya aplicada
                        <tr key={report.id} className={styles.tableRow}>
                            <td className={`${styles.tableDataCell} ${styles.dataPrimary}`} style={{ fontWeight: 600 }}>#{report.id}</td>
                            <td className={`${styles.tableDataCell} ${styles.dataPrimary}`}>
                                <div style={{ fontWeight: 600 }}>ID Usuario: {report.idUsuario}</div>
                                <div style={{ color: 'var(--color-primary-blue)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{report.urlPagina}</div>
                            </td>
                            <td className={`${styles.tableDataCell} ${styles.dataSecondary}`}>{report.idCategoria || 'N/A'}</td>
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
                            <td colSpan={6} className={styles.tableDataCell}>No se encontraron reportes que coincidan con los filtros.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        {/* Fin del contenedor scrollable */}
      </div>
    </div>
  );
}