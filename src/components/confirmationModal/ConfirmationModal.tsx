import React from 'react';
import styles from './confirmationModal.module.css'; // Crearemos este archivo CSS

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void; // Función a ejecutar si se confirma
  onCancel: () => void;  // Función para cerrar/cancelar
}

export default function ConfirmationModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null; // No renderizar si no está abierto
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonContainer}>
          <button onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={`${styles.button} ${styles.confirmButton}`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}