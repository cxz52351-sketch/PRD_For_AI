import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingFontLoader() {
  return (
    <style>{`
      /* === Premium Typography & Advanced Styling === */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
      
      .font-display { 
        font-family: 'Playfair Display', Georgia, serif;
        letter-spacing: -0.02em; 
        font-weight: 600;
        line-height: 1.2;
      }
      
      .font-sans-premium {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        letter-spacing: -0.01em;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 400% 400%;
        animation: gradient-shift 6s ease-in-out infinite;
      }
      
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      .mesh-gradient {
        background: 
          radial-gradient(at 40% 20%, hsla(228,100%,74%,0.5) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(189,100%,56%,0.5) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(340,100%,76%,0.4) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(22,100%,77%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 100%, hsla(242,100%,70%,0.5) 0px, transparent 50%),
          radial-gradient(at 0% 0%, hsla(343,100%,76%,0.3) 0px, transparent 50%),
          linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }
      
      .floating-orb {
        position: absolute;
        border-radius: 50%;
        opacity: 0.7;
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      .sophisticated-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 
          0 8px 32px rgba(31, 38, 135, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
      
      .premium-shadow {
        box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 4px 6px -1px rgba(0, 0, 0, 0.1), 
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
      
      .loading-pulse {
        animation: loading-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes loading-pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
      
      .gradient-skeleton {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 75%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  );
}

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
      <div className="min-h-screen w-full mesh-gradient font-sans-premium text-slate-900 antialiased relative overflow-hidden">
        <LoadingFontLoader />

        {/* Floating background elements */}
        <div className="floating-orb w-72 h-72 bg-gradient-to-r from-purple-300/30 to-pink-300/30 top-10 -left-20 blur-3xl" style={{ animationDelay: '0s' }} />
        <div className="floating-orb w-96 h-96 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 top-1/3 -right-32 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="floating-orb w-80 h-80 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 bottom-1/4 -left-40 blur-3xl" style={{ animationDelay: '4s' }} />
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {/* Logo和标题 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <img
                  src="/logo-prd-for-ai.svg"
                  alt="PRD For AI"
                  className="h-12 w-12 loading-pulse"
                />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">
                <span className="gradient-text">正在加载...</span>
              </h1>
              <p className="text-lg text-slate-600 font-sans-premium">请稍候，我们正在为您准备应用</p>
            </div>

            <Card className="sophisticated-card rounded-2xl premium-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="h-4 gradient-skeleton rounded-md"></div>
                  <div className="h-4 gradient-skeleton rounded-md w-3/4"></div>
                  <div className="h-4 gradient-skeleton rounded-md w-1/2"></div>
                </div>
                <div className="space-y-2 mt-6">
                  <div className="h-10 gradient-skeleton rounded-lg"></div>
                  <div className="h-10 gradient-skeleton rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
    // 检查是否有from参数，有则返回原路径，否则去应用主页
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    return <Navigate to={redirectTo || from || '/app'} replace />;
  }

  // 认证状态符合要求，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;
