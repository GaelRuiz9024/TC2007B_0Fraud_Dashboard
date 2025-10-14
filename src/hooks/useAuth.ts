'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../lib/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const getStoredToken = () => {
    if (typeof window !== 'undefined') {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    }
    return { accessToken: null, refreshToken: null };
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Función para obtener el perfil del usuario autenticado
  const fetchProfile = useCallback(async () => {
    const { accessToken } = getStoredToken();
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Intenta obtener el perfil con el accessToken
      const response = await api.get('/auth/profile');
      setUser(response.data.profile as UserProfile);
    } catch (error) {
      // Si el token de acceso falla, intenta refrescarlo
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const newAccessToken = refreshResponse.data.accessToken;
          setTokens(newAccessToken, refreshToken);
          
          // Reintentar la obtención del perfil con el nuevo token
          const profileResponse = await api.get('/auth/profile');
          setUser(profileResponse.data.profile as UserProfile);
        } else {
          clearTokens();
        }
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);
        clearTokens();
        // Redirigir si el token de refresco también falla
        if (window.location.pathname.startsWith('/dashboard')) {
            router.replace('/login');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(async (correo: string, contrasena: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { correo, contrasena });
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      
      await fetchProfile();
      
    } catch (error) {
      clearTokens();
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(() => {
    clearTokens();
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, isLoading, login, logout, fetchProfile };
}