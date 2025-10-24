import React, { useEffect } from 'react';
import styles from './notificationCard.module.css'; // Crearemos este archivo CSS

interface NotificationCardProps {
  message: string | null;
  type: 'success' | 'error' | null;
  onClose: () => void; // Función para cerrar la notificación
}

export default function NotificationCard({ message, type, onClose }: NotificationCardProps) {
  // Ocultar automáticamente después de unos segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Ocultar después de 5 segundos
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !type) {
    return null; // No renderizar si no hay mensaje
  }

  // Determinar la clase CSS según el tipo de notificación
  const cardClasses = `${styles.notificationCard} ${
    type === 'success' ? styles.success : styles.error
  }`;

  return (
    <div className={styles.overlay}>
      <div className={cardClasses}>
        <p className={styles.message}>{message}</p>
        <button onClick={onClose} className={styles.closeButton}>
          &times; {/* Símbolo de 'x' para cerrar */}
        </button>
      </div>
    </div>
  );
}