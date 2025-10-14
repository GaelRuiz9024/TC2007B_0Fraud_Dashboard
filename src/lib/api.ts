// gaelruiz9024/tc2007b_0fraud_dashboard/src/lib/api.ts
import axios, { AxiosError } from 'axios'; // Importar AxiosError
import { Buffer } from 'buffer'; // Buffer necesario para manejo de tokens (aunque puede no ser estrictamente necesario en este caso)

// URL base del backend NestJS
const API_BASE_URL = 'http://localhost:4000'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Referencia global para la función de logout (se inyecta desde el AuthContext)
let onLogoutCallback: (() => void) | null = null;
export const setLogoutCallback = (callback: () => void) => {
    onLogoutCallback = callback;
};

// Interceptor para inyectar el Access Token antes de cada solicitud (EXISTENTE)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 👈 NUEVO INTERCEPTOR DE RESPUESTA PARA REFRESH TOKEN
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Verificar si es un error 401 (Unauthorized) y que tenemos un refreshToken y no es la petición de refresh fallando
    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true; // Marcar la solicitud original para evitar bucles infinitos
      
      try {
        // Intentar refrescar el token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const newAccessToken = refreshResponse.data.accessToken;
        
        // Almacenar el nuevo token
        localStorage.setItem('accessToken', newAccessToken);

        // Reintentar la solicitud original con el nuevo Access Token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si el refresh token falla (401 o cualquier otro error), cerrar sesión
        if (onLogoutCallback) {
            onLogoutCallback();
        }
        return Promise.reject(refreshError);
      }
    }

    // Si el error no es 401, o es la solicitud original de refresh, o no hay refresh token, rechazar la promesa
    return Promise.reject(error);
  }
);