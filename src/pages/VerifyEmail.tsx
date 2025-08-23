import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("无效的验证链接");
        return;
      }

      try {
        const response = await api.auth.verifyEmail({ token });
        setStatus("success");
        setMessage(response.message);
        setEmail(response.email);
        
        toast({
          title: "验证成功",
          description: "邮箱验证成功，现在可以完成注册了",
        });

        // 3秒后跳转到注册页面
        setTimeout(() => {
          navigate("/register");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "验证失败");
        
        toast({
          title: "验证失败",
          description: error instanceof Error ? error.message : "邮箱验证失败",
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [searchParams, toast, navigate]);

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
          <h1 className="text-2xl font-bold text-foreground mb-2">邮箱验证</h1>
          <p className="text-muted-foreground">验证您的邮箱地址</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
              {status === "success" && <CheckCircle className="h-6 w-6 text-green-500" />}
              {status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
              
              {status === "loading" && "验证中..."}
              {status === "success" && "验证成功"}
              {status === "error" && "验证失败"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground/50" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                
                {email && (
                  <p className="text-sm font-medium text-primary">
                    {email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {status === "success" && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    即将跳转到注册页面...
                  </p>
                  <Button
                    onClick={() => navigate("/register")}
                    className="w-full btn-gradient-soft"
                  >
                    立即注册
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full"
                  >
                    重新尝试
                  </Button>
                  <Button
                    asChild
                    className="w-full btn-gradient-soft"
                  >
                    <Link to="/register">
                      返回注册页面
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* 底部链接 */}
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
          <p>如果您没有收到验证邮件，请检查垃圾邮件文件夹</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;