'use client';

import React from 'react';
import Image from 'next/image';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '@/components/authLayout/AuthLayout';
import styles from './login.module.css';
import { useRouter } from 'next/navigation'; 

const LoginSchema = Yup.object().shape({
  correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
  contraseña: Yup.string().min(6, 'Debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function LoginPage() {
  const router = useRouter(); 

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    console.log('Intento de inicio de sesión:', values);
    setTimeout(() => {
      alert(`¡Inicio de sesión exitoso simulado! Correo: ${values.correo}`);
      setSubmitting(false);

      router.replace('/dasboard/reports');
    }, 400);
  };

  return (
    <AuthLayout>
      <div className={styles.loginCard}>
        <div className={styles.imageContainer}>
          <Image
            src="/next.svg"
            alt="Seguridad digital"
            layout="fill"
            objectFit="cover"
            className="invert"
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
