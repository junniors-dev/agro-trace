// Contexto de autenticacion simulada.
// Guarda el usuario logueado en localStorage (sin JWT). Suficiente para la demo.
import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'agrotrace_usuario';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (celular, password) => {
    const { usuario } = await api.login(celular, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
