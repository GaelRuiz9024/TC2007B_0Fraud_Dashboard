// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/config/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SwitchComponent from '@/components/switch/Switch'; 
import styles from './config.module.css';
import reportStyles from '../reports/reports.module.css';
import { api } from '@/lib/api'; 
import { Category, User } from '@/lib/types'; 

// Esquema de validación para Crear Categoría
const CategorySchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es obligatorio'),
  descripcion: Yup.string().required('La descripción es obligatoria'),
  activa: Yup.boolean().required('El estado es obligatorio'),
});

const ROLES = [
  { id: 1, name: 'Administrador' },
  { id: 2, name: 'Usuario' },
];

export default function ConfigPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Funciones de Carga de Datos ---
  const fetchCategories = useCallback(async () => {
    try {
      // 🚨 LLAMADA A LA API
      const response = await api.get('/admin/categories'); 
      setCategories(response.data.filter((c: Category) => c.activa === 1 || c.activa === 0)); // Filtra por categorías activas e inactivas
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      // 🚨 LLAMADA A LA API
      const response = await api.get('/admin/user/list'); 
      setUsers(response.data.filter((user: any) => user.activo === 1)); // Solo mostrar usuarios activos (no eliminados)
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchUsers()])
      .finally(() => setIsLoading(false));
  }, [fetchCategories, fetchUsers]);

  // --- Manejo de Categorías ---
  const handleCategorySubmit = async (values: any, { setSubmitting, resetForm, setStatus }: any) => {
    setSubmitting(true);
    setStatus(undefined);

    try {
      // 🚨 LLAMADA A LA API
      await api.post('/admin/categories', { 
        nombre: values.nombre,
        descripcion: values.descripcion,
        activa: values.activa ? 1 : 0,
      });
      alert(`Categoría '${values.nombre}' creada exitosamente.`);
      resetForm({ values: { nombre: '', descripcion: '', activa: true } });
      await fetchCategories(); 
    } catch (error: any) {
      setStatus({ error: error.response?.data?.message || 'Error al crear categoría' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: number, currentActiva: 0|1) => {
    const newActiva = currentActiva === 1 ? 0 : 1;
    const newStatus = newActiva === 1 ? 'Activa' : 'Inactiva';
    
    if (!window.confirm(`¿Seguro que quieres cambiar el estado de la categoría a ${newStatus}?`)) {
        return;
    }

    try {
        // 🚨 LLAMADA A LA API
        await api.put(`/admin/categories/${id}`, { activa: newActiva }); 
        alert(`Categoría actualizada a ${newStatus}`);
        fetchCategories(); 
    } catch (error: any) {
        alert(`Error al actualizar la categoría: ${error.response?.data?.message || 'Error de conexión'}`);
    }
  };

  // --- Manejo de Usuarios y Roles ---
  const handleUpdateRole = async (userId: number, newRolId: number) => {
    const roleName = getRoleName(newRolId);
    if (!window.confirm(`¿Seguro que quieres cambiar el rol del usuario ${userId} a ${roleName}?`)) {
        return;
    }
    try {
      // 🚨 LLAMADA A LA API
      await api.put(`/admin/user/${userId}/role`, { idRol: newRolId }); 
      alert(`Rol de usuario ${userId} actualizado a ${roleName}`);
      await fetchUsers(); 
    } catch (error: any) {
      alert(`Error al actualizar rol: ${error.response?.data?.message || 'Error de conexión'}`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm(`⚠️ ¿Seguro que quieres ELIMINAR (desactivar) al usuario con ID ${userId}?`)) {
        return;
    }
    try {
      // 🚨 LLAMADA A LA API
      await api.delete(`/admin/user/${userId}`); 
      alert(`Usuario ${userId} eliminado (desactivado)`);
      await fetchUsers(); 
    } catch (error: any) {
      alert(`Error al eliminar usuario: ${error.response?.data?.message || 'Error de conexión'}`);
    }
  };

  const getRoleName = (idRol: number) => {
    return ROLES.find(r => r.id === idRol)?.name || 'Usuario';
  };
  
  const getCategoryStatus = (activa: 0|1) => activa === 1 ? 'Activa' : 'Inactiva';


  if (isLoading) {
    return <div className={reportStyles.pageContainer}><p>Cargando configuración...</p></div>;
  }

  return (
    <div className={reportStyles.pageContainer}>
      <h1 className={reportStyles.pageTitle}>Configuración</h1>

      <div className={styles.gridContainer}>
        {/* Crear Categoría (Formulario) */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Crear categoría</h2>
          <Formik
            initialValues={{ nombre: '', descripcion: '', activa: true }}
            validationSchema={CategorySchema}
            onSubmit={handleCategorySubmit}
          >
            {({ isSubmitting, setFieldValue, values, status }) => (
              <Form className={styles.form}>
                <div>
                  <label htmlFor="nombre" className={styles.formLabel}>Nombre</label>
                  <Field type="text" name="nombre" className={styles.formInput}/>
                  <ErrorMessage name="nombre" component="div" className={reportStyles.error} />
                </div>

                <div>
                  <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
                  <Field as="textarea" name="descripcion" rows={3} className={styles.formTextarea}/>
                  <ErrorMessage name="descripcion" component="div" className={reportStyles.error} />
                </div>

                <div className={styles.switchContainer}>
                  <label htmlFor="activa" className={styles.formLabel}>Activa</label>
                  <SwitchComponent
                    name="activa"
                    checked={values.activa}
                    onChange={(e) => setFieldValue('activa', e.target.checked)}
                  />
                </div>
                
                {status && status.error && <div className={reportStyles.error} style={{ textAlign: 'center' }}>{status.error}</div>}

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
                {['ID', 'Nombre', 'Estado', 'Acciones'].map((header) => (
                  <th key={header} className={reportStyles.tableHeaderCell}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className={reportStyles.tableRow}>
                  <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{category.id}</td>
                  <td className={`${reportStyles.tableDataCell} ${reportStyles.dataPrimary}`} style={{ fontWeight: 500 }}>{category.nombre}</td>
                  <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{getCategoryStatus(category.activa)}</td>
                  <td className={reportStyles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                    <button 
                        className={styles.tableActionLink}
                        onClick={() => handleUpdateCategory(category.id, category.activa)}
                    >
                        {category.activa === 1 ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && !isLoading && <p style={{ padding: '1rem' }}>No hay categorías.</p>}
        </div>
      </div>

      {/* Manejo de Usuarios y Roles (Tabla) */}
      <div className={reportStyles.tableContainer} style={{ gridColumn: 'span 2 / span 2', marginTop: '1.5rem' }}>
        <h2 className={styles.cardTitle} style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>Manejo de usuarios y roles</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className={reportStyles.tableHeader}>
            <tr>
              {['Id', 'Correo', 'Nombre', 'Rol', 'Modificar rol', 'Acciones'].map((header) => (
                <th key={header} className={reportStyles.tableHeaderCell}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={reportStyles.tableRow}>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{user.id}</td>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataPrimary}`}>{user.correo}</td>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{user.nombre}</td>
                <td className={`${reportStyles.tableDataCell} ${reportStyles.dataSecondary}`}>{getRoleName(user.idRol)}</td>
                <td className={reportStyles.tableDataCell}>
                  <select 
                    className={styles.tableSelect}
                    value={user.idRol}
                    onChange={(e) => handleUpdateRole(user.id, Number(e.target.value))}
                  >
                    {ROLES.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </td>
                <td className={reportStyles.tableDataCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                  <button 
                    className={styles.tableDeleteButton}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !isLoading && <p style={{ padding: '1rem' }}>No hay usuarios para mostrar.</p>}
      </div>
    </div>
  );
}