import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, getMe } from '../services/api';

const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount – if a token exists, validate it via /auth/me
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMe();
        // Backend may wrap user in data.user or return it at the top level
        const userData = data.user ?? data;
        setUser({
          id: userData.id ?? userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
        setToken(storedToken);
      } catch {
        // Token invalid / expired – clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ------ login ------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin(email, password);
    const receivedToken = data.token;
    const userData = data.user ?? data;

    const normalizedUser = {
      id: userData.id ?? userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(receivedToken);
    setUser(normalizedUser);

    return normalizedUser;
  }, []);

  // ------ logout -----------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  // ------ context value (memoised) -----------------------------------------
  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user,
      loading,
    }),
    [user, token, login, logout, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
