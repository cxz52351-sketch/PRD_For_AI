import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // 默认true，设为false则需要未认证状态
  redirectTo?: string;
}

/**
 * 受保护的路由组件
 * @param children - 子组件
 * @param requireAuth - 是否需要认证，默认true
 * @param redirectTo - 重定向路径，默认根据requireAuth决定
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
            </div>
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 需要认证但用户未登录
  if (requireAuth && !isAuthenticated) {
    // 保存当前路径，登录后可以返回
    const from = location.pathname + location.search;
    return <Navigate to={redirectTo || `/login?from=${encodeURIComponent(from)}`} replace />;
  }

  // 不需要认证但用户已登录（如登录页、注册页）
  if (!requireAuth && isAuthenticated) {
    // 检查是否有from参数，有则返回原路径，否则去首页
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    return <Navigate to={redirectTo || from || '/'} replace />;
  }

  // 认证状态符合要求，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;
