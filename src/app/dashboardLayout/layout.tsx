// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/DashboardLayout.tsx
'use client'; 
import Sidebar from '@/components/sidebar/Sidebar';
import React, { useEffect } from 'react'; // Importar useEffect
import styles from './dashboardLayout.module.css';
// CAMBIO: Usar el nuevo Context
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';

/**
 * Layout principal para todas las páginas dentro del dashboard.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CAMBIO: Desestructurar del nuevo hook
  const { isAuthenticated, loadingTokens, isAdmin, logout } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!loadingTokens && (!isAuthenticated || !isAdmin)) {
        // Redirigir si no está autenticado O si no tiene el rol de administrador (idRol: 1)
        logout(); // Limpiar tokens por si acaso (ej. token de usuario normal)
        router.replace('/login');
    }
  }, [loadingTokens, isAuthenticated, isAdmin, router, logout]);


  if (loadingTokens) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.5rem', color: '#1f2937' }}>
        Cargando autenticación...
      </div>
    );
  }

  // Renderizar el contenido SÓLO si está cargado Y es admin
  if (isAuthenticated && isAdmin) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <main className={styles.dashboardMainContent}>
          {children}
        </main>
      </div>
    );
  }

  return null;
}