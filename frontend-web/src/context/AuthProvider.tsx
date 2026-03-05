"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

// Token muddati — 7 kun (millisekundlarda)
const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, code: string, deviceId?: string, fcmToken?: string) => Promise<any>;
  register: (dto: any) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Token va foydalanuvchi ma'lumotlarini tozalash
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
    setToken(null);
    setUser(null);
  }, []);

  // Profil ma'lumotlarini yangilash
  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  // Ilova yuklanishida token ni tekshirish
  useEffect(() => {
    const init = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('token_expires_at');

        // Token yo'q — login qilinmagan
        if (!savedToken) {
          setLoading(false);
          return;
        }

        // Token muddati tugagan
        if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
          clearAuth();
          setLoading(false);
          return;
        }

        // Token bor va hali amal qilmoqda — profil yuklash
        setToken(savedToken);
        try {
          const res = await api.get('/users/profile');
          setUser(res.data);
        } catch (err: any) {
          // 401 — token server tomondan bekor qilingan
          if (err?.response?.status === 401) {
            clearAuth();
          } else {
            // Boshqa xatolik (tarmoq masalasi) — tokenni saqlab qolish
            setUser(null);
          }
        }
      } catch {
        // localStorage xatolik
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [clearAuth]);

  const sendOtp = async (phone: string) => {
    return api.post('/auth/send-otp', { phone }).then((r) => r.data);
  };

  const verifyOtp = async (phone: string, code: string, deviceId?: string, fcmToken?: string) => {
    const res = await api.post('/auth/verify-otp', { phone, code, deviceId, fcmToken });
    const newToken = res.data.token;
    if (newToken) {
      // Token va expire vaqtini saqlash (7 kun)
      localStorage.setItem('token', newToken);
      localStorage.setItem('token_expires_at', String(Date.now() + TOKEN_LIFETIME_MS));
      setToken(newToken);

      // Profil yuklash
      try {
        const profile = await api.get('/users/profile');
        setUser(profile.data);
      } catch {
        setUser(null);
      }
    }
    return res.data;
  };

  const register = async (dto: any) => {
    const res = await api.post('/auth/register', dto);
    // Profilni yangilash
    if (res.data) {
      setUser((prev: any) => ({ ...prev, ...res.data }));
    }
    return res.data;
  };

  const logout = () => {
    // Backend ga ham xabar berish
    api.post('/auth/logout').catch(() => {});
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
