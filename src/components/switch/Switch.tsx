// src/components/Switch.tsx
import React from 'react';
import styles from './switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

export default function Switch({ checked, onChange, name }: SwitchProps) {
  return (
    <label className={styles.switchLabel}>
      <div className={styles.switchDotContainer}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className={styles.switchInput}
        />
        <div className={styles.switchTrack}></div>
        <div className={styles.switchDot}></div>
      </div>
    </label>
  );
}