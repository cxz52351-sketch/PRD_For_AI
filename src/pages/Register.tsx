import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, Eye, EyeOff, ArrowRight, User, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email'); // 添加活动tab状态
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      handleRegister(activeTab);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      isValid: minLength && hasUpper && hasLower && hasNumber
    };
  };

  const passwordValidation = validatePassword(registerData.password);

  const handleRegister = async (type: "email" | "phone") => {
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确认两次输入的密码一致",
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "密码强度不足",
        description: "密码必须包含大小写字母、数字，且至少8位",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "请同意服务条款",
        description: "您需要同意服务条款才能注册",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = {
        username: registerData.username,
        password: registerData.password,
        ...(type === "email" ? { email: registerData.email } : { phone: registerData.phone })
      };

      await register(userData);

      toast({
        title: "注册成功",
        description: `使用${type === "email" ? "邮箱" : "手机号"}注册成功，欢迎加入！`,
      });

      // 注册成功后直接登录，跳转到主页
      navigate('/app', { replace: true });
    } catch (error) {
      toast({
        title: "注册失败",
        description: error instanceof Error ? error.message : "注册过程中出现错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleGoogleRegister = async () => {
    if (!agreeTerms) {
      toast({
        title: "请同意服务条款",
        description: "您需要同意服务条款才能注册",
        variant: "destructive",
      });
      return;
    }

    // TODO: 集成Google OAuth
    toast({
      title: "功能开发中",
      description: "Google注册功能正在开发中，请使用邮箱或手机号注册",
      variant: "default",
    });
  };

  const PasswordStrengthIndicator = ({ validation }: { validation: ReturnType<typeof validatePassword> }) => (
    <div className="space-y-2 text-xs">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${validation.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={validation.minLength ? 'text-green-600' : 'text-muted-foreground'}>至少8位字符</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${validation.hasUpper ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={validation.hasUpper ? 'text-green-600' : 'text-muted-foreground'}>包含大写字母</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${validation.hasLower ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={validation.hasLower ? 'text-green-600' : 'text-muted-foreground'}>包含小写字母</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${validation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={validation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>包含数字</span>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-foreground mb-2">欢迎加入</h1>
          <p className="text-muted-foreground">创建您的PRD For AI账户</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">创建账户</CardTitle>
            <CardDescription className="text-center">
              选择您偏好的注册方式
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google注册按钮 */}
            <Button
              onClick={handleGoogleRegister}
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
              使用 Google 注册
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full opacity-50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">或者</span>
              </div>
            </div>

            {/* 邮箱/手机号注册选项卡 */}
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
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="输入您的用户名"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="输入您的邮箱地址"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
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
                      placeholder="创建一个强密码"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
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
                  {registerData.password && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                      <PasswordStrengthIndicator validation={passwordValidation} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="再次输入密码"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                    <p className="text-xs text-red-500">密码不匹配</p>
                  )}
                  {registerData.confirmPassword && registerData.password === registerData.confirmPassword && registerData.password && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> 密码匹配
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleRegister("email")}
                  disabled={
                    isLoading ||
                    !registerData.username ||
                    !registerData.email ||
                    !passwordValidation.isValid ||
                    registerData.password !== registerData.confirmPassword
                  }
                  className="w-full btn-gradient-soft group"
                >
                  {isLoading ? "注册中..." : "注册账户"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-phone">用户名</Label>
                  <Input
                    id="username-phone"
                    type="text"
                    placeholder="输入您的用户名"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="输入您的手机号码"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
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
                      placeholder="创建一个强密码"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
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
                  {registerData.password && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                      <PasswordStrengthIndicator validation={passwordValidation} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-confirm-password">确认密码</Label>
                  <div className="relative">
                    <Input
                      id="phone-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="再次输入密码"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                    <p className="text-xs text-red-500">密码不匹配</p>
                  )}
                  {registerData.confirmPassword && registerData.password === registerData.confirmPassword && registerData.password && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> 密码匹配
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleRegister("phone")}
                  disabled={
                    isLoading ||
                    !registerData.username ||
                    !registerData.phone ||
                    !passwordValidation.isValid ||
                    registerData.password !== registerData.confirmPassword
                  }
                  className="w-full btn-gradient-soft group"
                >
                  {isLoading ? "注册中..." : "注册账户"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>
            </Tabs>

            {/* 服务条款同意 */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  我同意
                  <Link to="/terms" className="text-primary hover:underline mx-1">服务条款</Link>
                  和
                  <Link to="/privacy" className="text-primary hover:underline mx-1">隐私政策</Link>
                </Label>
              </div>
            </div>

            {/* 已有账户链接 */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">已有账户？</span>
              <Link
                to="/login"
                className="text-primary hover:underline ml-1 transition-colors"
              >
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>注册后您将能够使用完整的 AI 对话功能</p>
        </div>
      </div>
    </div>
  );
};

export default Register;