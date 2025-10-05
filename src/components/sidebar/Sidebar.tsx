// src/components/Sidebar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

const navItems = [
  { name: 'Reportes enviados', href: '/dashboard/reports', icon: '/file.svg' },
  { name: 'Análisis de tendencias', href: '/dashboard/trends', icon: '/window.svg' },
  { name: 'Configuración', href: '/dashboard/config', icon: '/globe.svg' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.aside}>
      {/* Sección del Logo/Título de la Aplicación */}
      <div className={styles.logoSection}>
        <Image src="/file.svg" alt="Lock icon" width={24} height={24} className="invert" />
        <h1 className={styles.logoTitle}>Fraude</h1>
      </div>

      {/* Menú de Navegación */}
      <nav style={{ flexGrow: 1 }}>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const linkClasses = `${styles.navLinkBase} ${
              isActive ? styles.navLinkActive : styles.navLinkInactive
            }`;

            return (
              <li key={item.name} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={item.href}
                  className={linkClasses}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.name} icon`}
                    width={20}
                    height={20}
                    className="invert"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className={styles.logoutSection}>
        <button
          onClick={() => {
            console.log('Cerrar sesión');
          }}
          className={styles.logoutButton}
        >
          <Image
            src="/file.svg"
            alt="Logout icon"
            width={20}
            height={20}
            className="invert"
          />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}