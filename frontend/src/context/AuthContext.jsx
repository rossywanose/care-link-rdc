import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching profile
          const response = await userAPI.getProfile();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, tokens } = response.data;

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Email ou mot de passe incorrect'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("[AuthContext] Register called with:", userData);

      const response = await authAPI.register(userData);
      console.log("[AuthContext] Register API response:", response.data);

      const { user, tokens } = response.data;

      // Vérifier que tokens existe
      if (!tokens || !tokens.access) {
        console.error("[AuthContext] No tokens in response:", response.data);
        return {
          success: false,
          error: 'Réponse invalide du serveur (pas de tokens)'
        };
      }

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error("[AuthContext] Register API error:", error.response?.data);

      // Formater l'erreur correctement
      const backendError = error.response?.data;
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';

      if (typeof backendError === 'object' && backendError !== null) {
        const firstKey = Object.keys(backendError)[0];
        const firstError = backendError[firstKey];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // ✅ NOUVEAU : Inscription autorité avec vérification matricule
  const registerAuthority = async (userData) => {
    try {
      console.log("[AuthContext] RegisterAuthority called with:", userData);

      const response = await authAPI.registerAuthority(userData);
      console.log("[AuthContext] RegisterAuthority API response:", response.data);

      const { user, tokens } = response.data;

      if (!tokens || !tokens.access) {
        console.error("[AuthContext] No tokens in response:", response.data);
        return {
          success: false,
          error: 'Réponse invalide du serveur (pas de tokens)'
        };
      }

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error("[AuthContext] RegisterAuthority API error:", error.response?.data);

      const backendError = error.response?.data;
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';

      if (typeof backendError === 'object' && backendError !== null) {
        const firstKey = Object.keys(backendError)[0];
        const firstError = backendError[firstKey];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/connexion';
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la mise à jour du profil'
      };
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/connexion';
    const role = user.role;
    if (role === 'hospital') return '/hospital-dashboard';
    if (role === 'authority') return '/authority-dashboard';
    return '/citizen-dashboard';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    registerAuthority,
    logout,
    updateProfile,
    getDashboardRoute,
    isCitizen: user?.role === 'citizen',
    isHospital: user?.role === 'hospital',
    isAuthority: user?.role === 'authority',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;