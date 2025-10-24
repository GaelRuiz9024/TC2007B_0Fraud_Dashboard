// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/reports/page.tsx
'use client';
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './reports.module.css';
import { api } from '@/lib/api';
import { Report } from '@/lib/types'; 
import SwitchComponent from '@/components/switch/Switch'; 
import NotificationCard from '@/components/notification/NotificationCard';
import ConfirmationModal from '@/components/confirmationModal/ConfirmationModal';

const REPORT_STATUSES = ['Pendiente', 'Aprobado', 'Rechazado'];

// Definición de la estructura de filtros
interface ReportFilters {
    id: string;
    categoria: string;
    url: string;
    showAllStatuses: boolean; 
}
interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirmAction: (() => void) | null; // Guardar la acción a ejecutar
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
  const [notification, setNotification] = useState<{ message: string | null; type: 'success' | 'error' | null }>({
    message: null,
    type: null,
  });

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirmAction: null,
  });
// Función para mostrar notificación
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Función para cerrar notificación
  const closeNotification = () => {
    setNotification({ message: null, type: null });
  };
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
  const openConfirmationModal = (message: string, onConfirm: () => void) => {
    setConfirmation({
      isOpen: true,
      message: message,
      onConfirmAction: onConfirm,
    });
  };
  const closeConfirmationModal = () => {
    setConfirmation({
      isOpen: false,
      message: '',
      onConfirmAction: null,
    });
  };
  const handleConfirmAction = () => {
    if (confirmation.onConfirmAction) {
      confirmation.onConfirmAction(); // Ejecuta la acción guardada
    }
    closeConfirmationModal(); // Cierra el modal
  };
 const handleUpdateStatus = (reportId: number, newStatus: string) => {
    // ✨ CAMBIO: Formatear el mensaje para ser más amigable
    let confirmationMessage = '';
    let emoji = '';

    switch (newStatus) {
      case 'Aprobado':
        emoji = '✅';
        confirmationMessage = `¿Estás seguro de Aprobar el reporte #${reportId}?`;
        break;
      case 'Rechazado':
        emoji = '❌';
        confirmationMessage = `¿Estás seguro de Rechazar el reporte #${reportId}?`;
        break;
      case 'Pendiente':
        emoji = '⏳';
        confirmationMessage = `¿Estás seguro de marcar como Pendiente el reporte #${reportId}?`;
        break;
      default:
        confirmationMessage = `¿Estás seguro de cambiar el estado del reporte #${reportId} a ${newStatus}?`;
    }

    const fullMessage = `${emoji} ${confirmationMessage}`; // Añadir emoji al inicio

    openConfirmationModal(
      fullMessage, // Usar el mensaje formateado
      // Pasar la lógica de actualización como la acción a confirmar
      async () => {
        try {
          await api.put(`/reports/admin/update-status/${reportId}`, { estado: newStatus });
          setReports(prevReports =>
            prevReports.map(report =>
              report.id === reportId
                ? { ...report, estado: newStatus }
                : report
            )
          );
          showNotification(`Reporte #${reportId} actualizado a: ${newStatus}`, 'success');
        } catch (err: any) {
          console.error('Error updating report status:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Error de conexión';
          showNotification(`Error al actualizar el reporte #${reportId}: ${errorMessage}`, 'error');
        }
      }
    );
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
          {/* ✨ NUEVO: Renderizar la notificación */}
          <NotificationCard
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
          <ConfirmationModal
            isOpen={confirmation.isOpen}
            message={confirmation.message}
            onConfirm={handleConfirmAction} // Llama a la función que ejecuta la acción
            onCancel={closeConfirmationModal} // Simplemente cierra el modal
          />
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
                    {['ID', 'ID Usuario/URL', 'ID Categoría', 'Descripción', 'Estado Actual'].map((header) => (
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
                            <td className={`${styles.tableDataCell} ${styles.statusSelectCell}`}> 
                              <select 
                                  className={styles.statusSelect} // <-- Clase para el select
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