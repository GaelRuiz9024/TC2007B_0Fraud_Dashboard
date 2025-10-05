import Sidebar from '@/components/sidebar/Sidebar';
import React from 'react';
import styles from './dashboardLayout.module.css'; // Asumiendo que el archivo .module.css está aquí.

/**
 * Layout principal para todas las páginas dentro del dashboard (ej. reports, trends, config).
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.dashboardMainContent}>
        {children}
      </main>
    </div>
  );
}