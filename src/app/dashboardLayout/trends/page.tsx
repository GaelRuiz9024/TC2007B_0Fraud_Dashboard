// src/app/(dashboard)/trends/page.tsx
import React from 'react';
import styles from './trends.module.css';
import reportStyles from '../reports/reports.module.css';

const PercentageDial = ({ percentage, label, color }: { percentage: number, label: string, color: string }) => {
  return (
    <div className={styles.dialContainer}>
      <div className={styles.dialCircle} style={{ backgroundColor: color, filter: 'brightness(0.9)' }}>
        <span className={styles.dialPercentageText}>{percentage}%</span>
      </div>
      <p className={styles.dialLabel}>{label}</p>
    </div>
  );
};

export default function TrendsPage() {
  const topCategories = [
    { percentage: 70, label: 'Phishing', color: '#ff4d4d' },
    { percentage: 30, label: 'Cripto', color: '#8884d8' },
    { percentage: 80, label: 'Productos falsos', color: '#ffa500' },
    { percentage: 45, label: 'Estafas en sitios web', color: '#32c7a8' },
    { percentage: 92, label: 'Fraude telefónico', color: '#ff3399' },
  ];

  const reportApproval = [
    { label: 'Aprobados', percentage: 15, color: '#ff3399' },
    { label: 'Rechazados', percentage: 25, color: '#ff9900' },
    { label: 'En revisión', percentage: 50, color: '#8884d8' },
  ];
  
  // Gráfico de Dona (Pie Chart) - Requiere estilo inline para conic-gradient.
  const pieChartStyle = {
    width: '10rem', height: '10rem', borderRadius: '9999px',
    background: `conic-gradient(#ff3399 0% 15%, #ff9900 15% 40%, #8884d8 40% 90%, #e0e0e0 90% 100%)`,
  };

  return (
    <div className={reportStyles.pageContainer}>
      <h1 className={reportStyles.pageTitle}>Análisis de tendencias</h1>

      <div className={styles.gridContainer}>
        {/* Top 5 Categorías de Fraude */}
        <div className={styles.card} style={{ gridColumn: 'span 1 / span 1' }}>
          <h2 className={styles.cardTitle}>Top 5 categorías de fraude</h2>
          <div style={{ margin: '1rem 0' }}>
            {topCategories.map((category) => (
              <PercentageDial key={category.label} {...category} />
            ))}
          </div>
        </div>

        {/* Categorías de Riesgo (Gráfico de Líneas) */}
        <div className={styles.card} style={{ gridColumn: 'span 1 / span 2' }}>
          <h2 className={styles.cardTitle}>Categorías de riesgo</h2>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartInnerPlaceholder}>
                <span className={styles.chartInnerPlaceholderSpan}>Gráfico de Líneas (Placeholder)</span>
            </div>
            <p className={`${styles.chartAxisLabel} ${styles.chartAxisLabelX}`}>Semanas</p>
            <p className={`${styles.chartAxisLabel} ${styles.chartAxisLabelY}`}>No. incidencias</p>
          </div>
        </div>

        {/* Porcentaje de Reportes Aprobados (Gráfico de Dona) */}
        <div className={`${styles.card} ${styles.gridContainer}`} style={{ gridColumn: 'span 3 / span 3', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <h2 className={styles.cardTitle} style={{ gridColumn: 'span 2 / span 2' }}>Porcentaje de reportes aprobados</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={pieChartStyle}></div>
          </div>
          <div className={styles.legendContainer}>
            {reportApproval.map((item) => (
              <div key={item.label} className={styles.legendItem}>
                <span className={styles.legendColorSquare} style={{ backgroundColor: item.color }}></span>
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendPercentage} style={{ color: item.color }}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}