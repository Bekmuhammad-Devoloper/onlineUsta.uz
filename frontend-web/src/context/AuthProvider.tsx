"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

type AuthContextType = {
  user: any | null;
  token: string | null;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, code: string, deviceId?: string, fcmToken?: string) => Promise<any>;
  register: (dto: any) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      if (t) {
        setToken(t);
        // optionally fetch profile
        api.get('/users/profile')
          .then((res) => setUser(res.data))
          .catch(() => setUser(null));
      }
    } catch (e) {}
  }, []);

  const sendOtp = async (phone: string) => {
    return api.post('/auth/send-otp', { phone }).then((r) => r.data);
  };

  const verifyOtp = async (phone: string, code: string, deviceId?: string, fcmToken?: string) => {
    const res = await api.post('/auth/verify-otp', { phone, code, deviceId, fcmToken });
    const token = res.data.token;
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
      // fetch profile
      try {
        const profile = await api.get('/users/profile');
        setUser(profile.data);
      } catch (e) {
        setUser(null);
      }
    }
    return res.data;
  };

  const register = async (dto: any) => {
    const res = await api.post('/auth/register', dto);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, sendOtp, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
