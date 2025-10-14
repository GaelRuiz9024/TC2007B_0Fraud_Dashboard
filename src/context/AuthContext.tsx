// gaelruiz9024/tc2007b_0fraud_dashboard/src/context/AuthContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// 👈 Importar api y la nueva función setLogoutCallback
import { api, setLogoutCallback } from "@/lib/api"; 
import { UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation"; // Necesario para la redirección después del logout

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
  // Eliminamos tryRefreshAndFetchProfile ya que ahora es manejado por el interceptor
};

const AuthContext = createContext<AuthContextType | null>(null);

// ... (Funciones auxiliares setTokens y clearTokens) ...

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
  const router = useRouter(); // Inicializar router
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(true);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return null;

    try {
        const response = await api.get('/auth/profile');
        return response.data.profile as UserProfile;
    } catch (error) {
        // Si falla aquí, significa que el token está expirado, el interceptor lo manejará o ya falló el refresh.
        return null;
    }
  }, []);
  
  // 👈 NUEVA FUNCIÓN DE LOGOUT CENTRAL (con redirección)
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.replace('/login'); 
  }, [router]);

  // 👈 Función para cargar la sesión al inicio o después de un refresh/login
  const loadSession = useCallback(async () => {
    setLoadingTokens(true);
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
        const profile = await fetchProfile();
        if (profile) {
            setUser(profile);
            setLoadingTokens(false);
            return;
        } 
    }
    
    // Si no hay token o el perfil falla al cargar (interceptor no refrescó), limpiar sesión
    clearTokens();
    setUser(null);
    setLoadingTokens(false);

  }, [fetchProfile]);


  // 👈 Efecto 1: Cargar la sesión al inicio
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // 👈 Efecto 2: Inyectar la función de logout en el interceptor de Axios
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);


  // --- Auth Actions ---
  const login = useCallback(
    async (correo: string, contrasena: string) => {
      setLoadingTokens(true);
      try {
        const response = await api.post("/auth/login", {
          correo,
          contrasena,
        });
        
        const tokens: Tokens = {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        };
        setTokens(tokens.accessToken, tokens.refreshToken);
        
        // Forzar la carga del perfil con el nuevo token
        await loadSession(); 
        
      } catch (error) {
        clearTokens();
        setUser(null);
        throw error;
      } finally {
        setLoadingTokens(false);
      }
    },
    [loadSession]
  );


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
    }),
    [
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      loadingTokens,
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