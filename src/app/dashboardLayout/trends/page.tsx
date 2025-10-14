// src/app/dashboardLayout/trends/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import styles from './trends.module.css';
import reportStyles from '../reports/reports.module.css';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

// ========== TIPOS PARA LOS DATOS ==========
interface CategoryData {
    percentage: number;
    label: string;
    color: string;
}

interface LineChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color: string;
    }[];
}

interface DonutChartData {
    labels: string[];
    data: number[];
    colors: string[];
}

// ========== COMPONENTE: ANILLO DE PORCENTAJE CON CHART.JS ==========
const PercentageDial = ({ percentage, label, color }: CategoryData) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Destruir gráfica anterior si existe
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        // Crear degradado
        const gradient = ctx.createLinearGradient(0, 0, 100, 100);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, lightenColor(color, 50));

        const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [gradient, 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                rotation: -90,
                circumference: 360,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [percentage, color]);

    return (
        <div className={styles.dialContainer}>
            <div className={styles.dialCircle} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <canvas ref={chartRef}></canvas>
                <span className={styles.dialPercentageText} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                }}>{percentage}%</span>
            </div>
            <p className={styles.dialLabel}>{label}</p>
        </div>
    );
};

// ========== COMPONENTE: GRÁFICO DE LÍNEAS CON CHART.JS ==========
const LineChartComponent = ({ data }: { data: LineChartData }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current || !containerRef.current) return;

        // IMPORTANTE: Destruir la instancia anterior antes de crear una nueva
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const datasets = data.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color,
            backgroundColor: dataset.color,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
        }));

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 0,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        },
                        title: {
                            display: true,
                            text: 'No. incidencias',
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        },
                        title: {
                            display: true,
                            text: 'Semanas',
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        };

        chartInstance.current = new Chart(ctx, config);

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [data]);

    return (
        <div 
            ref={containerRef}
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '250px',
                maxHeight: '250px',
                overflow: 'hidden'
            }}
        >
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

// ========== COMPONENTE: GRÁFICO DE DONA CON CHART.JS ==========
const DonutChartComponent = ({ data }: { data: DonutChartData }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderWidth: 4,
                    borderColor: '#2D3748',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <div style={{ width: '8rem', height: '8rem' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

// ========== FUNCIÓN AUXILIAR: ACLARAR COLOR ==========
const lightenColor = (color: string, percent: number): string => {
    let num = parseInt(color.slice(1), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let B = (num >> 8 & 0x00FF) + amt;
    let G = (num & 0x0000FF) + amt;
    R = (R < 255 ? R : 255);
    B = (B < 255 ? B : 255);
    G = (G < 255 ? G : 255);
    return `#${(G | (B << 8) | (R << 16)).toString(16).padStart(6, '0')}`;
};

// ========== COMPONENTE PRINCIPAL ==========
export default function TrendsPage() {
    // Estados para los datos (serán reemplazados por llamadas a API)
    const [topCategories, setTopCategories] = useState<CategoryData[]>([
        { percentage: 20, label: 'Phishing', color: '#ff4d4d' },
        { percentage: 30, label: 'Cripto', color: '#8884d8' },
        { percentage: 80, label: 'Productos falsos', color: '#ffa500' },
        { percentage: 45, label: 'Estafas en sitios web', color: '#32c7a8' },
        { percentage: 92, label: 'Fraude telefónico', color: '#ff3399' },
    ]);

    const [lineChartData, setLineChartData] = useState<LineChartData>({
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'],
        datasets: [
            { label: 'Phishing', data: [30, 40, 35, 50, 45, 60, 55], color: '#ff4d4d' },
            { label: 'Cripto', data: [20, 25, 30, 28, 35, 32, 40], color: '#8884d8' },
            { label: 'Productos falsos', data: [15, 22, 20, 25, 23, 27, 26], color: '#ffa500' },
        ]
    });

    const [donutChartData, setDonutChartData] = useState<DonutChartData>({
        labels: ['Aprobados', 'Rechazados', 'En revisión'],
        data: [45, 35, 25],
        colors: ['#ff3399', '#ffa500', '#8884d8']
    });

    // ========== LLAMADAS A API (Ejemplo) ==========
    useEffect(() => {
        // Aquí irían tus llamadas a los endpoints
        const fetchData = async () => {
            try {
                // Ejemplo de llamada a API para Top 5 categorías
                // const response = await fetch('/api/trends/top-categories');
                // const data = await response.json();
                // setTopCategories(data);

                // Ejemplo de llamada a API para gráfico de líneas
                // const lineResponse = await fetch('/api/trends/risk-categories');
                // const lineData = await lineResponse.json();
                // setLineChartData(lineData);

                // Ejemplo de llamada a API para gráfico de dona
                // const donutResponse = await fetch('/api/trends/report-approval');
                // const donutData = await donutResponse.json();
                // setDonutChartData(donutData);

            } catch (error) {
                console.error('Error fetching trends data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={reportStyles.pageContainer} style={{ paddingBottom: '1rem' }}>
            <h1 className={reportStyles.pageTitle} style={{ marginBottom: '1rem' }}>Análisis de tendencias</h1>

                <div className={styles.gridContainer} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr',
                    gridAutoRows: 'min-content',
                    gap: '1rem',
                    alignItems: 'start'
                }}>

                
                {/* Top 5 Categorías de Fraude */}
                <div className={styles.card} style={{ 
                    gridColumn: '1 / 2', 
                    gridRow: 'span 2',
                    overflow: 'auto',
                    backgroundColor: '#374151',
                    padding: '1.25rem'
                }}>
                    <h2 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Top 5 categorías de fraude</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topCategories.map((category) => (
                            <PercentageDial key={category.label} {...category} />
                        ))}
                    </div>
                </div>

                {/* Categorías de Riesgo (Gráfico de Líneas) */}
                <div className={styles.card} style={{ 
                    gridColumn: '2 / 3', 
                    gridRow: '1 / 2',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#374151',
                    padding: '1.25rem'
                }}>
                    <h2 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>Categorías de riesgo</h2>
                    <div style={{ padding: '0.25rem 0' }}>
                        <LineChartComponent data={lineChartData} />
                    </div>
                </div>

                {/* Porcentaje de Reportes Aprobados */}
                <div className={styles.card} style={{ 
                    gridColumn: '2 / 3', 
                    gridRow: '2 / 3',
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    alignItems: 'center',
                    backgroundColor: '#374151'
                }}>
                    <h2 className={styles.cardTitle} style={{ gridColumn: 'span 2 / span 2', marginBottom: '0.5rem' }}>
                        Porcentaje de reportes aprobados
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DonutChartComponent data={donutChartData} />
                    </div>

                    <div className={styles.legendContainer}>
                        {donutChartData.labels.map((label, index) => (
                            <div key={label} className={styles.legendItem}>
                                <span 
                                    className={styles.legendColorSquare} 
                                    style={{ backgroundColor: donutChartData.colors[index] }}
                                ></span>
                                <span className={styles.legendLabel}>{label}</span>
                                <span 
                                    className={styles.legendPercentage} 
                                    style={{ color: donutChartData.colors[index] }}
                                >
                                    {donutChartData.data[index]}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}