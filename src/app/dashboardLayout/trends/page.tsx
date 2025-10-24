// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/trends/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './trends.module.css';
import reportStyles from '../reports/reports.module.css';
import { api } from '@/lib/api';
// 👈 IMPORTAR EL TIPO HISTÓRICO
import { ReportsByCategory, StatusPecentage, HistoricalReportData } from '@/lib/types'; 

// 1. IMPORTAR Y REGISTRAR CHART.JS
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  ChartData
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Colores consistentes para los gráficos
const COLORS = [
  '#ff4d4d', // Rojo/Phishing
  '#8884d8', // Morado/Cripto
  '#ffa500', // Naranja/Productos Falsos
  '#32c7a8', // Turquesa/Estafas Web
  '#ff3399', // Rosa/Fraude Telefónico
  '#0088fe', 
];

interface AnalyticsData {
    topCategories: (ReportsByCategory & { color: string, percentage: number })[];
    reportApproval: (StatusPecentage & { color: string })[];
    historicalTrends: HistoricalReportData[]; // 👈 AÑADIR DATOS HISTÓRICOS AL ESTADO
}

const PercentageDial = ({ percentage, label, color }: { percentage: number, label: string, color: string }) => {
  return (
    <div className={styles.dialContainer}>
      <div className={styles.dialCircle} style={{ backgroundColor: color, filter: 'brightness(0.9)' }}>
        <span className={styles.dialPercentageText}>{percentage.toFixed(0)}%</span>
      </div>
      <p className={styles.dialLabel}>{label}</p>
    </div>
  );
};

// 👈 FUNCIÓN CLAVE: Transforma los datos del backend al formato de Chart.js (pivotear)
const processHistoricalData = (rawData: HistoricalReportData[]): ChartData<"line"> => {
    // 1. Obtener todas las fechas únicas (labels) y ordenarlas
    const dates = Array.from(new Set(rawData.map(d => d.date))).sort();

    // 2. Obtener todas las categorías únicas
    const categories = Array.from(new Set(rawData.map(d => d.categoryName)));

    // 3. Mapear cada categoría a un dataset
    const datasets = categories.map((category, index) => {
        // Mapea los datos recibidos a un objeto Map { fecha: conteo } para acceso rápido
        const categoryDataMap = new Map(
            rawData
                .filter(d => d.categoryName === category)
                .map(d => [d.date, d.reportCount])
        );
        
        // Generar puntos de datos: si no hay conteo para esa fecha/categoría, es 0
        const dataPoints = dates.map(date => categoryDataMap.get(date) || 0);

        return {
            label: category,
            data: dataPoints,
            borderColor: COLORS[index % COLORS.length],
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 5, 
            pointBackgroundColor: COLORS[index % COLORS.length], // Puntos visibles
        };
    });

    return {
        // Formatear las fechas para ser más amigables (ej. '01/Oct')
        labels: dates.map(date => {
            const [, month, day] = date.split('-');
            return `${day}/${month}`;
        }),
        datasets: datasets,
    };
};

// Función para mapear datos del API al formato Doughnut de Chart.js
const getDoughnutChartData = (reportApproval: (StatusPecentage & { color: string })[]) => {
  return {
    labels: reportApproval.map(item => item.status),
    datasets: [
      {
        data: reportApproval.map(item => item.count), 
        backgroundColor: reportApproval.map(item => item.color),
        borderColor: reportApproval.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };
};

// Opciones de configuración para el gráfico de líneas (mantienen el estilo)
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false, // Ocultar la leyenda de Chart.js
        },
    },
    scales: {
        y: {
            title: {
                display: true,
                text: 'No. incidencias',
                color: 'white', 
            },
            ticks: { color: 'white' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            beginAtZero: true, // Empezar en cero
        },
        x: {
            title: {
                display: true,
                text: 'Semanas / Días',
                color: 'white',
            },
            ticks: { color: 'white' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
    }
};

export default function TrendsPage() {
  const [data, setData] = useState<AnalyticsData>({ 
      topCategories: [], 
      reportApproval: [],
      historicalTrends: [], // 👈 ESTADO INICIAL VACÍO
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesResponse, statusResponse, historicalResponse] = await Promise.all([
        api.get<ReportsByCategory[]>('/analytics/reports-by-category?limit=5'), 
        api.get<StatusPecentage[]>('/analytics/status-percentage'), 
        api.get<HistoricalReportData[]>('/analytics/historical-trends'), // 👈 CONSUMO DEL ENDPOINT HISTÓRICO
      ]);

      const fetchedCategories = categoriesResponse.data;
      const totalCategoryReports = fetchedCategories.reduce((sum, item) => sum + item.reportCount, 0);

      const topCategoriesWithPercentage = fetchedCategories.map((item, index) => ({
          ...item,
          color: COLORS[index % COLORS.length],
          percentage: totalCategoryReports > 0 ? (item.reportCount / totalCategoryReports) * 100 : 0
      }));

      const reportApprovalWithColor = statusResponse.data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
      }));
      
      setData({
        topCategories: topCategoriesWithPercentage,
        reportApproval: reportApprovalWithColor,
        historicalTrends: historicalResponse.data, // 👈 ALMACENAMIENTO DE DATOS
      });

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('No se pudieron cargar los datos de analítica. Verifique el backend y la consola.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (isLoading) {
    return <div className={reportStyles.pageContainer}><p>Cargando análisis de tendencias...</p></div>;
  }

  if (error) {
    return <div className={reportStyles.pageContainer}><p style={{ color: 'var(--color-red-error)' }}>Error: {error}</p></div>;
  }

  // Preparar datos de gráficos
  const doughnutData = getDoughnutChartData(data.reportApproval);
  const lineChartData = processHistoricalData(data.historicalTrends); // 👈 USAR LA FUNCIÓN DE PROCESAMIENTO

  return (
    <div className={reportStyles.pageContainer}>
      <h1 className={reportStyles.pageTitle}>Análisis de tendencias</h1>

      <div className={styles.gridContainer}>
        
        {/* TARJETA IZQUIERDA (Top 5 - Ocupa 2 filas) */}
        <div className={styles.card} style={{ gridColumn: 'span 1 / span 1', gridRow: 'span 2 / span 2' }}>
          <h2 className={styles.cardTitle}>Top 5 categorías de fraude (Porcentaje Total)</h2>
          <div style={{ margin: '1rem 0' }}>
            {data.topCategories.length === 0 ? (
                <p className={styles.dialLabel}>No hay datos de categorías.</p>
            ) : (
                data.topCategories.map((category) => (
                    <PercentageDial 
                        key={category.categoryName} 
                        percentage={category.percentage} 
                        label={`${category.categoryName} (${category.reportCount} reportes)`} 
                        color={category.color} 
                    />
                ))
            )}
          </div>
        </div>
        
        {/* TARJETA SUPERIOR DERECHA (Gráfico de Líneas Histórico con Chart.js) */}
        <div className={styles.card} style={{ gridColumn: 'span 2 / span 2' }}>
          <h2 className={styles.cardTitle}>Categorías de riesgo (Histórico)</h2>
          <div style={{ flexGrow: 1, minHeight: '18rem', position: 'relative' }}>
            {data.historicalTrends.length === 0 ? (
                 <div className={styles.chartInnerPlaceholder}><span className={styles.chartInnerPlaceholderSpan}>No hay datos históricos recientes (últimos 7 días).</span></div>
            ) : (
                <Line options={lineChartOptions} data={lineChartData} />
            )}
          </div>
        </div>

        {/* TARJETA INFERIOR DERECHA (Porcentaje de Reportes por Estado - Gráfico de Dona con Chart.js) */}
        <div className={styles.card} style={{ gridColumn: 'span 2 / span 2' }}>
          <h2 className={styles.cardTitle}>Porcentaje de reportes por estado</h2>
          
          {data.reportApproval.length === 0 ? (
                <p>No hay datos de estado de reportes.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '10rem', height: '10rem' }}>
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                    {/* Leyenda manual */}
                    <div className={styles.legendContainer}>
                      {data.reportApproval.map((item) => (
                        <div key={item.status} className={styles.legendItem}>
                          <span className={styles.legendColorSquare} style={{ backgroundColor: item.color }}></span>
                          <span className={styles.legendLabel}>{item.status}</span>
                          <span className={styles.legendPercentage} style={{ color: item.color }}>{item.percentage.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                </div>
            )
          }

        </div>
      </div>
    </div>
  );
}