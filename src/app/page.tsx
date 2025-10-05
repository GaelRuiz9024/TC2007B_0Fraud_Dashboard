// src/app/page.tsx
'use client'; // Indica que este componente se ejecuta en el cliente.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Componente simple para redirigir
export default function Home() {
  const router = useRouter();

  // Redirige al cliente a /login después de que la aplicación carga
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Se puede mostrar un spinner o mensaje de carga mientras redirecciona
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
      Cargando...
    </div>
  );
}