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

      // 获取登录前的路径，如果有的话
      const from = searchParams.get('from') || '/';
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
    <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo-prd-for-ai.svg"
              alt="PRD For AI"
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">欢迎回来</h1>
          <p className="text-muted-foreground">登录到 PRD For AI</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">登录账户</CardTitle>
            <CardDescription className="text-center">
              选择您偏好的登录方式
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google登录按钮 */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 bg-background/50 hover:bg-background/80 border border-border/60 transition-all duration-200 hover:shadow-md"
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
                <Separator className="w-full opacity-50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">或者</span>
              </div>
            </div>

            {/* 邮箱/手机号登录选项卡 */}
            <Tabs defaultValue="email" value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'phone')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
                <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  邮箱
                </TabsTrigger>
                <TabsTrigger value="phone" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  手机
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="输入您的邮箱地址"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入您的密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
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
                  className="w-full btn-gradient-soft group"
                >
                  {isLoading ? "登录中..." : "登录"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="输入您的手机号码"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-password">密码</Label>
                  <div className="relative">
                    <Input
                      id="phone-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入您的密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
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
                  className="w-full btn-gradient-soft group"
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
                className="text-primary hover:underline transition-colors"
              >
                忘记密码？
              </Link>
              <Link
                to="/register"
                className="text-primary hover:underline transition-colors"
              >
                没有账户？注册
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>登录即表示您同意我们的</p>
          <div className="mt-1">
            <Link to="/terms" className="text-primary hover:underline">服务条款</Link>
            <span className="mx-2">和</span>
            <Link to="/privacy" className="text-primary hover:underline">隐私政策</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;