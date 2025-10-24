// src/components/Sidebar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname , useRouter } from 'next/navigation';
import styles from './sidebar.module.css';
import { useAuth } from '@/context/AuthContext';

const navItems = [
 { name: 'Reportes enviados', href: '/dashboardLayout/reports', icon: '/file.svg' },
 { name: 'Análisis de tendencias', href: '/dashboardLayout/trends', icon: '/window.svg' },
 { name: 'Configuración', href: '/dashboardLayout/config', icon: '/globe.svg' },
];

export default function Sidebar() {
 const pathname = usePathname();
 const{ logout } = useAuth();
 const router = useRouter(); 


 const handleLogout = () => {
    console.log('Cerrar sesión');
    logout(); // Llama a la función del contexto para limpiar tokens
    router.replace('/login'); // Redirige al usuario a la página de login
  }
 return (
  <aside className={styles.aside}>
   {/* Sección del Logo/Título de la Aplicación */}

   {/* Sección del Logo/Título de la Aplicación */}
   <div className={styles.logoSection}>
    <Image 
     src="/Logo.jpg" 
     alt="Logo de Fraude" 
     width={180} // Valor grande para que Next.js genere una imagen de alta resolución
     height={60} // Valor alto para mantener la proporción, el CSS lo ajustará
     className={styles.logoImage} 
    />
   </div>

   {/* Menú de Navegación */}
   <nav className={styles.nav}>
    <ul className={styles.navList}>
     {navItems.map((item) => {
      const isActive = pathname === item.href;
      const linkClasses = `${styles.navLinkBase} ${
       isActive ? styles.navLinkActive : styles.navLinkInactive
      }`;

      return (
       <li key={item.name} className={styles.navItem}>
        <Link href={item.href} className={linkClasses}>
         <Image
          src={item.icon}
          alt={`${item.name} icon`}
          width={22}
          height={22}
          className="invert"
         />
         <span>{item.name}</span>
        </Link>
       </li>
      );
     })}
    </ul>
   </nav>

   {/* Botón de Cerrar Sesión (Ahora usando la clase de enlace base) */}
    <div className={styles.logoutSection}>
        <button
          onClick={handleLogout} // <-- Llamar a la función handleLogout
          className={`${styles.navLinkBase} ${styles.logoutButton}`}
        >
        <div className={styles.avatar}>N</div>
        <span>Cerrar sesión</span>
 
        </button>
      </div>
          
  </aside>
 );
}