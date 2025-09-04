import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, type AuthResponse, type RegisterRequest, type LoginRequest } from './api';

// 用户数据类型定义
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

// 认证上下文类型定义
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 注册数据类型
export interface RegisterData {
  username: string;
  email?: string;
  phone?: string;
  password: string;
}

// 登录响应类型
interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 计算是否已认证
  const isAuthenticated = !!user;

  // 初始化时检查本地存储的认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);

          // 检查token是否过期
          const tokenExpiry = localStorage.getItem('token_expiry');
          if (tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
            setUser(parsedUser);
          } else {
            // Token过期，清除本地存储
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 清除认证存储
  const clearAuthStorage = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token_expiry');
    setUser(null);
  };

  // 保存认证数据
  const saveAuthData = (response: LoginResponse) => {
    const expiryTime = new Date().getTime() + (response.expiresIn * 1000);

    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    localStorage.setItem('token_expiry', expiryTime.toString());

    setUser(response.user);
  };

  // 邮箱登录
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        identifier: email,
        password,
        login_type: "email"
      };

      const response = await api.auth.login(loginData);

      // 转换API响应格式为内部格式
      const authData: LoginResponse = {
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          avatar: response.user.avatar,
          createdAt: response.user.created_at,
        },
        token: response.access_token,
        expiresIn: response.expires_in,
      };

      saveAuthData(authData);
    } catch (error) {
      console.error('邮箱登录失败:', error);
      throw new Error('登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  // 手机号登录
  const loginWithPhone = async (phone: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        identifier: phone,
        password,
        login_type: "phone"
      };

      const response = await api.auth.login(loginData);

      // 转换API响应格式为内部格式
      const authData: LoginResponse = {
        user: {
          id: response.user.id,
          username: response.user.username,
          phone: response.user.phone,
          avatar: response.user.avatar,
          createdAt: response.user.created_at,
        },
        token: response.access_token,
        expiresIn: response.expires_in,
      };

      saveAuthData(authData);
    } catch (error) {
      console.error('手机号登录失败:', error);
      throw new Error('登录失败，请检查手机号和密码');
    } finally {
      setIsLoading(false);
    }
  };

  // 用户注册
  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      };

      const response = await api.auth.register(registerData);

      // 转换API响应格式为内部格式
      const authData: LoginResponse = {
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          phone: response.user.phone,
          avatar: response.user.avatar,
          createdAt: response.user.created_at,
        },
        token: response.access_token,
        expiresIn: response.expires_in,
      };

      saveAuthData(authData);
    } catch (error) {
      console.error('注册失败:', error);
      throw new Error('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const logout = () => {
    clearAuthStorage();
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithPhone,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};


