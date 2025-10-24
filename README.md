# 💻 0 Fraud Admin Dashboard — Manual Técnico

## 📘 Descripción General

El **0 Fraud Admin Dashboard** es la aplicación frontend construida con **Next.js (App Router)** y **React 19** que consume la **API de ciberseguridad** (desarrollada en **NestJS**, según la documentación de referencia).

Su finalidad principal es ofrecer a los administradores una interfaz para la **gestión y monitoreo del sistema de reportes de fraude**, con las siguientes funcionalidades clave:

* **🔐 Autenticación segura:** Implementación de JWT con manejo de **Refresh Token** a través de un interceptor de Axios.
* **📊 Visualización de datos:** Gráficos de tendencias y métricas utilizando **Chart.js**.
* **🗂️ Gestión de reportes:** Filtrado, búsqueda y actualización del estado de cada reporte (`Pendiente`, `Aprobado`, `Rechazado`).

---

## ⚙️ Instalación y Configuración

### 🔧 Requisitos Previos

* **Node.js** v18 o superior.
* **npm** o **yarn** (se recomienda usar `npm` ya que el `package-lock.json` es de npm).

### 📁 Instalación del Proyecto

Ejecuta el siguiente comando para instalar las dependencias:

```bash
npm install
```

---

### 🌐 Configuración de la API

La URL base para las llamadas al backend está configurada en:

```typescript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:4000'; // Modificar si el backend usa otro puerto

export const api = axios.create({
  baseURL: API_BASE_URL,
});
```

> 💡 **Nota:** Asegúrate de que el backend (NestJS) se esté ejecutando en el mismo puerto configurado (`http://localhost:4000` por defecto) para que el dashboard funcione correctamente.

---

## 🧩 Estructura Principal del Proyecto (Frontend)

La aplicación utiliza la estructura modular del **Next.js App Router**, organizada de la siguiente forma:

| Carpeta / Módulo          | Contenido Clave                                                           | Descripción                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/login`           | `page.tsx`, `login.module.css`                                            | Formulario de inicio de sesión con validación usando **Formik** y **Yup**.                                        |
| `src/app/dashboardLayout` | `layout.tsx`, `/reports/page.tsx`, `/trends/page.tsx`, `/config/page.tsx` | Layout base del dashboard y sus páginas principales. Incluye protección de rutas (solo rol Admin: `idRol === 1`). |
| `src/context`             | `AuthContext.tsx`, `ThemeContext.tsx`                                     | Manejo de estado global de autenticación y tema (claro/oscuro).                                                   |
| `src/lib`                 | `api.ts`, `types.ts`                                                      | Configuración de Axios y definición de tipos. Incluye lógica de **refresh token** para manejar errores 401.       |
| `src/components`          | `Sidebar.tsx`, `ConfirmationModal.tsx`, `NotificationCard.tsx`            | Componentes de interfaz reutilizables, incluyendo barra lateral, modales y notificaciones.                        |

---

## ▶️ Ejecución del Proyecto

Para iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

El dashboard estará disponible en:

> [http://localhost:3000](http://localhost:3000)

---

## 🔑 Flujo de Autenticación (Frontend)

1. **Login:** El usuario ingresa credenciales en `/login`.
2. **Tokens:** Tras un login exitoso, se almacenan `accessToken` y `refreshToken` en `localStorage`.
3. **Acceso restringido:** Si el usuario es administrador (`idRol === 1`), se redirige automáticamente al dashboard principal.
4. **Refresh automático:** Si una llamada API responde con `401 Unauthorized`, el **interceptor de Axios** usa el `refreshToken` para obtener un nuevo `accessToken` y reintenta la solicitud original.

---

## 🧑‍💼 Funcionalidades del Dashboard

| Ruta                       | Descripción                                                                                                                                            | Archivo Fuente                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `/dashboardLayout/reports` | Visualización y gestión de reportes. Incluye filtros por ID, URL y categoría. Actualización de estado mediante `PUT /reports/admin/update-status/:id`. | `src/app/dashboardLayout/reports/page.tsx` |
| `/dashboardLayout/trends`  | Visualización de métricas y tendencias históricas. Muestra el Top 5 de categorías y gráficos de línea y dona con **Chart.js**.                         | `src/app/dashboardLayout/trends/page.tsx`  |
| `/dashboardLayout/config`  | Gestión administrativa: categorías, roles y usuarios (crear, activar/desactivar, cambiar roles).                                                       | `src/app/dashboardLayout/config/page.tsx`  |

---

## 🎨 Estilos y UI

* **Estilización:** Se utiliza **CSS Modules** junto con variables globales en `src/app/globals.css`.
* **Tailwind CSS:** Integrado mediante configuración de **PostCSS**.
* **Tema Oscuro:** Soporte para modo oscuro mediante `prefers-color-scheme: dark` y control dinámico desde `ThemeContext`.
* **Componentes UI:**

  * `ConfirmationModal` → Confirmaciones críticas (cambio de rol, eliminación, actualización de estado).
  * `NotificationCard` → Feedback visual ante respuestas de API (éxito/error).

---

## 🧪 Pruebas y Mejora Continua

* Se recomienda usar **Jest** o **React Testing Library** para pruebas unitarias de componentes.
* Validar endpoints del backend antes de desplegar.
* Verificar que las rutas protegidas no sean accesibles sin tokens válidos.

---

## 📚 Recursos Útiles

* [Documentación oficial de Next.js](https://nextjs.org/docs)
* [Documentación de Chart.js](https://www.chartjs.org/docs/latest/)
* [Formik y Yup](https://formik.org/docs/overview)
* [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## 🧾 Metadatos del Proyecto

* **Versión:** 0.1.0
* **Framework:** Next.js (App Router)
* **Librerías principales:** React 19, Axios, Formik, Chart.js, Tailwind CSS
* **Autor:** Equipo 0 Fraud — Proyecto de Ciberseguridad (Tec de Monterrey)
