// src/app/(dashboard)/reports/page.tsx
import Image from 'next/image';
import React from 'react';
import styles from './reports.module.css';

// Datos simulados
const mockReports = [
  { id: '#BA13568A', user: 'Pepito', url: 'https://paginafraude.com', description: 'El usuario reporta haber recibido un correo electrónico sospechoso que aparentaba provenir de ...', photo: '/file.svg' },
  { id: '#BA13568B', user: 'Juanita', url: 'https://otrofraude.net', description: 'El usuario reporta haber recibido un correo electrónico sospechoso que aparentaba provenir de ...', photo: '/file.svg' },
];

export default function ReportsPage() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Home Page (Reportes pendientes)</h1>

      {/* Filtros de Búsqueda */}
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

      {/* Tabla de Reportes Pendientes */}
      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Reportes pendientes de revisión</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className={styles.tableHeader}>
            <tr>
              {['Foto', 'Datos del reporte', 'Descripción', 'Info'].map((header) => (
                <th key={header} className={styles.tableHeaderCell}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockReports.map((report, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={`${styles.tableDataCell} ${styles.photoCell}`}>
                  <div className={styles.photoPlaceholder}>
                    <Image src={report.photo} alt="Placeholder" width={32} height={32} className="invert"/>
                  </div>
                </td>
                <td className={`${styles.tableDataCell} ${styles.dataPrimary}`}>
                  <div style={{ fontWeight: 600 }}>{report.id}</div>
                  <div className={styles.dataSecondary}>{report.user}</div>
                  <div style={{ color: 'var(--color-primary-blue)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{report.url}</div>
                </td>
                <td className={`${styles.tableDataCell} ${styles.dataSecondary}`} style={{ maxWidth: 300, whiteSpace: 'normal' }}>
                  {report.description}
                </td>
                <td className={styles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                  <button className={styles.infoButton}><span style={{ fontSize: '1.25rem' }}>+</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}