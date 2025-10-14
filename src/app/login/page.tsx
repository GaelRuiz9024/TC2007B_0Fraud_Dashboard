'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '@/components/authLayout/AuthLayout';
import styles from './login.module.css';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext';


const LoginSchema = Yup.object().shape({
  correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
  contraseña: Yup.string().min(6, 'Debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function LoginPage() {
  const router = useRouter(); 
  // CAMBIO: Desestructurar del nuevo hook
  const { login, isAuthenticated, loadingTokens, isAdmin } = useAuth(); 

  // Manejo de redirección inicial
  useEffect(() => {
    if (!loadingTokens && isAuthenticated && isAdmin) {
        router.replace('/dashboardLayout/reports');
    }
  }, [loadingTokens, isAuthenticated, isAdmin, router]);

  if (loadingTokens) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Cargando...
      </div>
    );
  }
  
  if (isAuthenticated && isAdmin) {
      return null;
  }

  const handleSubmit = async (values: any, { setSubmitting, setStatus }: any) => {
    setSubmitting(true);
    setStatus(undefined); 

    try {
      await login(values.correo, values.contraseña);
      // La redirección ocurrirá automáticamente gracias al useEffect del componente.
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      setStatus({ error: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.loginCard}>
        <div className={styles.imageContainer}>
          <Image
            src="/Logo1.png"
            alt="Seguridad digital"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.title}>¡Hola de nuevo!</h2>

          <Formik
            initialValues={{ correo: '', contraseña: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={styles.form}>
                <div>
                  <label htmlFor="correo" className={styles.label}>Correo</label>
                  <Field
                    type="email"
                    name="correo"
                    placeholder="tu.correo@ejemplo.com"
                    className={styles.input}
                  />
                  <ErrorMessage name="correo" component="div" className={styles.error}/>
                </div>

                <div>
                  <label htmlFor="contraseña" className={styles.label}>Contraseña</label>
                  <Field
                    type="password"
                    name="contraseña"
                    placeholder="********"
                    className={styles.input}
                  />
                  <ErrorMessage name="contraseña" component="div" className={styles.error}/>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.buttonBase} ${
                    isSubmitting ? styles.buttonDisabled : styles.buttonEnabled
                  }`}
                >
                  {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </AuthLayout>
  );
}
