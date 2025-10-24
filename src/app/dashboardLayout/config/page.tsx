// gaelruiz9024/tc2007b_0fraud_dashboard/src/app/dashboardLayout/config/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SwitchComponent from '@/components/switch/Switch'; 
import styles from './config.module.css';
import reportStyles from '../reports/reports.module.css'; // Importa estilos necesarios, incluyendo .tableWrapper
import { api } from '@/lib/api'; 
import { Category, User } from '@/lib/types'; 
import NotificationCard from '@/components/notification/NotificationCard';
import ConfirmationModal from '@/components/confirmationModal/ConfirmationModal';
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

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirmAction: (() => void) | null;
}

export default function ConfigPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
// ✨ 3. AÑADIR ESTADOS PARA NOTIFICACIÓN Y CONFIRMACIÓN
  const [notification, setNotification] = useState<{ message: string | null; type: 'success' | 'error' | null }>({
    message: null,
    type: null,
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirmAction: null,
  });

  // ✨ 4. AÑADIR FUNCIONES HELPER
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };
  const closeNotification = () => {
    setNotification({ message: null, type: null });
  };
  const openConfirmationModal = (message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, message: message, onConfirmAction: onConfirm });
  };
  const closeConfirmationModal = () => {
    setConfirmation({ isOpen: false, message: '', onConfirmAction: null });
  };
  const handleConfirmAction = () => {
    if (confirmation.onConfirmAction) {
      confirmation.onConfirmAction();
    }
    closeConfirmationModal();
  };

// --- Funciones de Carga de Datos ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/admin/categories'); 
      setCategories(response.data.filter((c: Category) => c.activa === 1 || c.activa === 0));
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/user/list'); 
      setUsers(response.data); 
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchUsers()])
      .finally(() => setIsLoading(false));
  }, [fetchCategories, fetchUsers]);
  // --- Manejo de Categorías ---
  // ✅ 5. MODIFICAR handleCategorySubmit
  const handleCategorySubmit = async (values: any, { setSubmitting, resetForm, setStatus }: any) => {
    setSubmitting(true);
    setStatus(undefined);
    try {
      await api.post('/admin/categories', {
        nombre: values.nombre,
        descripcion: values.descripcion,
        activa: values.activa ? 1 : 0,
      });
      showNotification(`Categoría '${values.nombre}' creada exitosamente. ✨`, 'success'); // <-- Reemplazar alert
      resetForm({ values: { nombre: '', descripcion: '', activa: true } });
      await fetchCategories();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Error al crear categoría';
      setStatus({ error: errMsg });
      showNotification(`Error: ${errMsg}`, 'error'); // <-- Reemplazar alert
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 6. MODIFICAR handleUpdateCategory
  const handleUpdateCategory = async (id: number, currentActiva: 0 | 1) => {
    const newActiva = currentActiva === 1 ? 0 : 1;
    const actionText = newActiva === 1 ? 'Activar' : 'Desactivar';
    const emoji = newActiva === 1 ? '✅' : '⏳';

    openConfirmationModal( // <-- Reemplazar window.confirm
      `${emoji} ¿Seguro que quieres ${actionText.toLowerCase()} la categoría #${id}?`,
      async () => { // Acción a confirmar
        try {
          await api.put(`/admin/categories/${id}`, { activa: newActiva });
          showNotification(`Categoría #${id} actualizada a ${actionText === 'Activar' ? 'Activa' : 'Inactiva'}.`, 'success'); // <-- Reemplazar alert
          fetchCategories();
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Error de conexión';
          showNotification(`Error al actualizar la categoría #${id}: ${errMsg}`, 'error'); // <-- Reemplazar alert
        }
      }
    );
  };

  // --- Manejo de Usuarios y Roles ---
  // ✅ 7. MODIFICAR handleUpdateRole
  const handleUpdateRole = async (userId: number, newRolId: number) => {
    const roleName = getRoleName(newRolId);
    const emoji = newRolId === 1 ? '👑' : '👤';

    openConfirmationModal( // <-- Reemplazar window.confirm
      `${emoji} ¿Seguro que quieres cambiar el rol del usuario #${userId} a ${roleName}?`,
      async () => { // Acción a confirmar
        try {
          await api.put(`/admin/user/${userId}/role`, { idRol: newRolId });
          showNotification(`Rol del usuario #${userId} actualizado a ${roleName}.`, 'success'); // <-- Reemplazar alert
          await fetchUsers();
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Error de conexión';
          showNotification(`Error al actualizar rol del usuario #${userId}: ${errMsg}`, 'error'); // <-- Reemplazar alert
        }
      }
    );
  };

  // ✅ 8. MODIFICAR handleDeleteUser
  const handleDeleteUser = async (userId: number) => {
    openConfirmationModal( // <-- Reemplazar window.confirm
      `🗑️ ¿Seguro que quieres ELIMINAR (desactivar) al usuario #${userId}? Esta acción marcará al usuario como inactivo.`,
      async () => { // Acción a confirmar
        try {
          await api.delete(`/admin/user/${userId}`);
          showNotification(`Usuario #${userId} desactivado correctamente.`, 'success'); // <-- Reemplazar alert
          await fetchUsers(); // Refrescar la lista para que desaparezca
        } catch (error: any) {
           const errMsg = error.response?.data?.message || 'Error de conexión';
           showNotification(`Error al desactivar usuario #${userId}: ${errMsg}`, 'error'); // <-- Reemplazar alert
        }
      }
    );
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
      <NotificationCard
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        message={confirmation.message}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmationModal}
      />
      <h1 className={reportStyles.pageTitle}>Configuración</h1>

      <div className={styles.gridContainer}>
        {/* Crear Categoría (Formulario Reestablecido) */}
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

{/* Categorías Existentes */}
        <div className={`${styles.card} ${styles.tableCard}`}>
          <h2 className={styles.cardTitle}>Categorías existentes</h2>
          {/* ✅ CAMBIO: Añadir clase específica */}
          <div className={`${styles.tableWrapper} ${styles.categoryTableWrapper}`}>
            <table>
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
          </div>
          {categories.length === 0 && !isLoading && <p style={{ padding: '1rem' }}>No hay categorías.</p>}
        </div>
      </div>

      {/* Manejo de Usuarios y Roles (Tabla) */}
      <div className={`${styles.card} ${styles.tableCard} ${styles.userTableContainer}`}> {/* Aplicar clases card, tableCard y userTableContainer */}        <h2 className={styles.cardTitle} style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>Manejo de usuarios y roles</h2>
        
        {/* ✅ APLICAR SCROLL: tableWrapper */}
        <div className={reportStyles.tableWrapper}>
          <table >
            <thead className={reportStyles.tableHeader}>
              <tr>
                {['Id', 'Correo', 'Nombre',  'Modificar rol', 'Acciones'].map((header) => (
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
        </div>
        {users.length === 0 && !isLoading && <p style={{ padding: '1rem' }}>No hay usuarios para mostrar.</p>}
      </div>
    </div>
  );
}