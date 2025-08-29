import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

function FontLoader() {
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
      
      .brand-logo { 
        font-family: 'Inter', system-ui, sans-serif; 
        letter-spacing: -0.025em; 
        font-weight: 800;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #d946ef 50%, #ec4899 75%, #f472b6 100%);
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
      
      .glass-effect {
        backdrop-filter: blur(20px) saturate(180%);
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }
      
      .mesh-gradient {
        background: 
          radial-gradient(at 40% 20%, hsla(292,100%,80%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(324,100%,85%,0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(340,100%,88%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(315,100%,76%,0.5) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(270,100%,82%,0.3) 0px, transparent 50%),
          radial-gradient(at 80% 100%, hsla(300,100%,78%,0.4) 0px, transparent 50%),
          radial-gradient(at 0% 0%, hsla(330,100%,80%,0.4) 0px, transparent 50%),
          linear-gradient(135deg, #f8f5ff 0%, #ede4ff 100%);
      }
      
      .premium-shadow {
        box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 4px 6px -1px rgba(0, 0, 0, 0.1), 
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
      
      .hover-lift {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .hover-lift:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      }
      
      .premium-button {
        background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .premium-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.6s;
      }
      
      .premium-button:hover::before {
        left: 100%;
      }
      
      .premium-button:hover {
        background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
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
    `}</style>
  );
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email'); // 添加活动tab状态
  const [loginData, setLoginData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const { toast } = useToast();
  const { login, loginWithPhone, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      handleLogin(activeTab);
    }
  };

  const handleLogin = async (type: "email" | "phone") => {
    try {
      if (type === "email") {
        await login(loginData.email, loginData.password);
      } else {
        await loginWithPhone(loginData.phone, loginData.password);
      }

      toast({
        title: "登录成功",
        description: `使用${type === "email" ? "邮箱" : "手机号"}登录成功`,
      });

      // 获取登录前的路径，如果有的话，否则跳转到主应用
      const from = searchParams.get('from') || '/app';
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "登录过程中出现错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: 集成Google OAuth
    toast({
      title: "功能开发中",
      description: "Google登录功能正在开发中，请使用邮箱或手机号登录",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen w-full mesh-gradient font-sans-premium text-slate-900 antialiased relative overflow-hidden">
      <FontLoader />

      {/* Floating background elements */}
      <div className="floating-orb w-72 h-72 bg-gradient-to-r from-purple-400/40 to-pink-400/40 top-10 -left-20 blur-3xl" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 top-1/3 -right-32 blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bg-gradient-to-r from-violet-300/35 to-fuchsia-300/35 bottom-1/4 -left-40 blur-3xl" style={{ animationDelay: '4s' }} />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/logo-prd-for-ai.svg"
                alt="PRD For AI"
                className="h-12 w-12 hover-lift"
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
              <span className="gradient-text">欢迎回来</span>
            </h1>
            <p className="text-lg text-slate-600 font-sans-premium">登录到 PRD For AI</p>
          </div>

        <Card className="sophisticated-card rounded-2xl premium-shadow hover-lift">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl text-center text-slate-900">登录账户</CardTitle>
            <CardDescription className="text-center text-slate-600 font-sans-premium">
              选择您偏好的登录方式
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google登录按钮 */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 glass-effect hover:shadow-md transition-all duration-300 text-slate-700 font-medium"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              使用 Google 登录
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full opacity-30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 font-medium">或者</span>
              </div>
            </div>

            {/* 邮箱/手机号登录选项卡 */}
            <Tabs defaultValue="email" value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'phone')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 glass-effect rounded-xl">
                <TabsTrigger value="email" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg font-medium transition-all">
                  <Mail className="w-4 h-4 mr-2" />
                  邮箱
                </TabsTrigger>
                <TabsTrigger value="phone" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg font-medium transition-all">
                  <Phone className="w-4 h-4 mr-2" />
                  手机
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="输入您的邮箱地址"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="glass-effect border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入您的密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="glass-effect border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => handleLogin("email")}
                  disabled={isLoading || !loginData.email || !loginData.password}
                  className="w-full premium-button group text-white font-semibold py-3 rounded-xl"
                >
                  {isLoading ? "登录中..." : "登录"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">手机号码</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="输入您的手机号码"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="glass-effect border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-password" className="text-slate-700 font-medium">密码</Label>
                  <div className="relative">
                    <Input
                      id="phone-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入您的密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="glass-effect border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => handleLogin("phone")}
                  disabled={isLoading || !loginData.phone || !loginData.password}
                  className="w-full premium-button group text-white font-semibold py-3 rounded-xl"
                >
                  {isLoading ? "登录中..." : "登录"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>
            </Tabs>

            {/* 忘记密码和注册链接 */}
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
              >
                忘记密码？
              </Link>
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
              >
                没有账户？注册
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p className="font-sans-premium">登录即表示您同意我们的</p>
          <div className="mt-2">
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors">服务条款</Link>
            <span className="mx-2 text-slate-400">和</span>
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors">隐私政策</Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;