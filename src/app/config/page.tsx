// src/app/(dashboard)/config/page.tsx
'use client';

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SwitchComponent from '@/components/switch/Switch'; 
import styles from './config.module.css';
import reportStyles from '../reports/reports.module.css';

// Esquema de validación para Crear Categoría
const CategorySchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es obligatorio'),
  descripcion: Yup.string(),
  activa: Yup.boolean().required('El estado es obligatorio'),
});

// Datos simulados
const mockCategories = [
  { id: 1, nombre: 'Phishing', estado: 'Activa' },
  { id: 2, nombre: 'Spam', estado: 'Inactiva' },
];

const mockUsers = [
  { id: 101, nombre: 'Admin User', rol: 'Administrador' },
  { id: 102, nombre: 'Reviewer 1', rol: 'Revisor' },
];

export default function ConfigPage() {
  const handleCategorySubmit = (values: any, { setSubmitting, resetForm }: any) => {
    console.log('Crear nueva categoría:', values);
    setTimeout(() => {
      alert(`Categoría creada: ${values.nombre} (Activa: ${values.activa})`);
      setSubmitting(false);
      resetForm({ values: { nombre: '', descripcion: '', activa: true } });
    }, 400);
  };

  return (
    <div className={reportStyles.pageContainer}>
      <h1 className={reportStyles.pageTitle}>Configuración</h1>

      <div className={styles.gridContainer}>
        {/* Crear Categoría (Formulario con Formik/Yup) */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Crear categoría</h2>
          <Formik
            initialValues={{ nombre: '', descripcion: '', activa: true }}
            validationSchema={CategorySchema}
            onSubmit={handleCategorySubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className={styles.form}>
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className={styles.formLabel}>Nombre</label>
                  <Field type="text" name="nombre" className={styles.formInput}/>
                  <ErrorMessage name="nombre" component="div" className={reportStyles.error} />
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
                  <Field as="textarea" name="descripcion" rows={3} className={styles.formTextarea}/>
                  <ErrorMessage name="descripcion" component="div" className={reportStyles.error} />
                </div>

                {/* Activa Switch */}
                <div className={styles.switchContainer}>
                  <label htmlFor="activa" className={styles.switchLabel}>Activa</label>
                  <SwitchComponent
                    name="activa"
                    checked={values.activa}
                    onChange={(e) => setFieldValue('activa', e.target.checked)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.formButtonBase} ${
                    isSubmitting ? styles.formButtonDisabled : styles.formButtonEnabled
                  }`}
                >
                  <span style={{ fontSize: '1.25rem', lineHeight: '1rem' }}>+</span>
                  {isSubmitting ? 'Creando...' : 'Crear nueva categoría'}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Categorías Existentes (Tabla) */}
        <div className={reportStyles.tableContainer}>
          <h2 className={styles.cardTitle} style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>Categorías existentes</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className={reportStyles.tableHeader}>
              <tr>
                {['Nombre', 'Estado', 'Acciones'].map((header) => (
                  <th key={header} className={reportStyles.tableHeaderCell}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCategories.map((category) => (
                <tr key={category.id} className={reportStyles.tableRow}>
                  <td className={`${reportStyles.tableDataCell} ${reportStyles.dataPrimary}`} style={{ fontWeight: 500 }}>{category.nombre}</td>
                  <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{category.estado}</td>
                  <td className={reportStyles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                    <button className={styles.tableActionLink}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manejo de Usuarios y Roles (Tabla) */}
      <div className={reportStyles.tableContainer} style={{ gridColumn: 'span 2 / span 2', marginTop: '1.5rem' }}>
        <h2 className={styles.cardTitle} style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>Manejo de usuarios y roles</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className={reportStyles.tableHeader}>
            <tr>
              {['Id', 'Nombre', 'Rol', 'Modificar rol', 'Acciones'].map((header) => (
                <th key={header} className={reportStyles.tableHeaderCell}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className={reportStyles.tableRow}>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataPrimary}`} style={{ fontWeight: 500 }}>{user.id}</td>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataPrimary}`}>{user.nombre}</td>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{user.rol}</td>
                <td className={reportStyles.tableDataCell}>
                  <select className={styles.tableSelect}>
                    <option>{user.rol}</option>
                    <option>Administrador</option>
                    <option>Revisor</option>
                    <option>Usuario</option>
                  </select>
                </td>
                <td className={reportStyles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                  <button className={styles.tableDeleteButton}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}