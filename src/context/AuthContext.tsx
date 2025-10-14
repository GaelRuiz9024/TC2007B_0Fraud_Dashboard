// gaelruiz9024/tc2007b_0fraud_dashboard/src/context/AuthContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { UserProfile } from "@/lib/types";

// --- Tipos Adaptados ---
type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
  loadingTokens: boolean;
  tryRefreshAndFetchProfile: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// --- Funciones auxiliares ---
const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

// --- Provider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // Función para obtener el perfil del usuario autenticado (usa el token del interceptor)
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return null;

    try {
        const response = await api.get('/auth/profile');
        return response.data.profile as UserProfile;
    } catch (error) {
        return null;
    }
  }, []);

  // Función para intentar refrescar el token si el de acceso falla
  const tryRefreshAndFetchProfile = useCallback(async (): Promise<boolean> => {
    setLoadingTokens(true);
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        clearTokens();
        setUser(null);
        setLoadingTokens(false);
        return false;
    }

    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        
        // Asumiendo que el backend devuelve { accessToken: string }
        setTokens(response.data.accessToken, refreshToken);
        
        const profile = await fetchProfile();
        if (profile) {
            setUser(profile);
            setLoadingTokens(false);
            return true;
        } else {
            clearTokens();
            setUser(null);
            setLoadingTokens(false);
            return false;
        }
    } catch (error) {
        clearTokens();
        setUser(null);
        setLoadingTokens(false);
        return false;
    }
  }, [fetchProfile]);
  
  // Lógica de carga inicial: verificar tokens existentes
  const initialLoad = useCallback(async () => {
    setLoadingTokens(true);
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
        let profile = await fetchProfile();
        if (profile) {
            setUser(profile);
            setLoadingTokens(false);
            return;
        } else {
            // Intenta refrescar si el access token es inválido/expirado
            await tryRefreshAndFetchProfile();
            return;
        }
    }
    
    // Si no hay token en localStorage, o el proceso de refresh/fetch falló
    clearTokens();
    setUser(null);
    setLoadingTokens(false);

  }, [fetchProfile, tryRefreshAndFetchProfile]);


  useEffect(() => {
    initialLoad();
  }, [initialLoad]);


  // --- Auth Actions ---
  const login = useCallback(
    async (correo: string, contrasena: string) => {
      setLoadingTokens(true);
      try {
        const response = await api.post("/auth/login", {
          correo,
          contrasena,
        });
        
        // El backend NestJS devuelve { accessToken, refreshToken }
        const tokens: Tokens = {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        };
        setTokens(tokens.accessToken, tokens.refreshToken);
        
        // Obtener el perfil después de obtener los tokens
        const profile = await fetchProfile();
        if (profile) {
            setUser(profile);
        } else {
            // Esto debería ser un error si el login fue exitoso pero el perfil falla
            throw new Error("Perfil de usuario no encontrado después del login.");
        }
        
      } catch (error) {
        clearTokens();
        setUser(null);
        throw error;
      } finally {
        setLoadingTokens(false);
      }
    },
    [fetchProfile]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.idRol === 1;

  const values = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      loadingTokens,
      tryRefreshAndFetchProfile
    }),
    [
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      loadingTokens,
      tryRefreshAndFetchProfile
    ]
  );
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}