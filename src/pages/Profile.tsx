import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Save, User, Mail, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // 这里应该调用后端API更新用户信息
      // 暂时只更新本地状态
      updateUser(profileData);

      setIsEditing(false);
      toast({
        title: "保存成功",
        description: "个人资料已更新",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "更新个人资料时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  // 获取用户名首字母作为头像回退
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-aurora">
      {/* 头部导航 */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="hover:bg-background/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-xl font-semibold">个人资料</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 头像和基本信息卡片 */}
        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-border/20">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-medium text-xl">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => toast({
                    title: "功能开发中",
                    description: "头像上传功能正在开发中",
                  })}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email || user.phone}</p>
                <Badge variant="outline" className="mt-2">
                  活跃用户
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 详细信息卡片 */}
        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  个人信息
                </CardTitle>
                <CardDescription>
                  管理您的个人账户信息
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-background/10"
                >
                  编辑
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-gradient-soft"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "保存中..." : "保存"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 用户名 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                用户名
              </Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                />
              ) : (
                <div className="p-3 bg-muted/30 rounded-md text-foreground">
                  {user.username}
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                邮箱地址
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                />
              ) : (
                <div className="p-3 bg-muted/30 rounded-md text-foreground">
                  {user.email || "未设置"}
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* 手机号 */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                手机号码
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-background/60 border-border/60 focus:border-primary transition-colors"
                />
              ) : (
                <div className="p-3 bg-muted/30 rounded-md text-foreground">
                  {user.phone || "未设置"}
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* 注册时间 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                注册时间
              </Label>
              <div className="p-3 bg-muted/30 rounded-md text-foreground">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息卡片 */}
        <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
          <CardHeader>
            <CardTitle>使用统计</CardTitle>
            <CardDescription>
              您在 Indus AI 中的活动数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">对话次数</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
                <div className="text-2xl font-bold text-secondary">8</div>
                <div className="text-sm text-muted-foreground">文件上传</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">导出记录</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-muted-foreground">总使用天数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

