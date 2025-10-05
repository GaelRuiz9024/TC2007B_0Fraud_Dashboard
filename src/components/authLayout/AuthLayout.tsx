// src/components/AuthLayout.tsx
import React from 'react';
import styles from './authLayout.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authContainer}>
      {children}
    </div>
  );
}