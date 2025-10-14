// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/DashboardLayout.tsx
'use client'; 
import Sidebar from '@/components/sidebar/Sidebar';
import React, { useEffect } from 'react';
import styles from './dashboardLayout.module.css';
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
  // Ahora el interceptor llama a logout(), solo necesitamos reaccionar al estado.
  const { isAuthenticated, loadingTokens, isAdmin } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    // Si la carga terminó y no es admin, redirigir. 
    // El logout ya es llamado por el interceptor si el token falla.
    if (!loadingTokens && (!isAuthenticated || !isAdmin)) {
        router.replace('/login');
    }
  }, [loadingTokens, isAuthenticated, isAdmin, router]);


  if (loadingTokens) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.5rem', color: '#1f2937' }}>
        Cargando autenticación...
      </div>
    );
  }

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