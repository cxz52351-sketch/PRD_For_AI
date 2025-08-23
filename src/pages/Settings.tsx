import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Settings2,
  Palette,
  Shield,
  Bell,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Globe,
  Lock,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 设置状态
  const [settings, setSettings] = useState({
    // 外观设置
    theme: "auto", // light, dark, auto
    language: "zh-CN",
    fontSize: "medium",

    // 通知设置
    notifications: true,
    emailNotifications: false,
    pushNotifications: true,

    // 隐私设置
    profileVisible: true,
    activityVisible: false,

    // 聊天设置
    autoSave: true,
    streamingMode: true,
    soundEnabled: false,

    // 安全设置
    twoFactorEnabled: false,
    sessionTimeout: "30", // 分钟
  });

  // 密码修改状态
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // 模拟保存设置
    toast({
      title: "设置已保存",
      description: "您的偏好设置已自动保存",
    });
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "请填写完整信息",
        description: "当前密码和新密码都不能为空",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "密码强度不足",
        description: "新密码至少需要8位字符",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 这里应该调用后端API修改密码
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "密码修改成功",
        description: "您的密码已更新，请使用新密码登录",
      });
    } catch (error) {
      toast({
        title: "密码修改失败",
        description: "修改密码时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "导出请求已提交",
      description: "我们将在24小时内将您的数据发送到注册邮箱",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "功能开发中",
      description: "账户删除功能正在开发中，如需删除账户请联系客服",
      variant: "destructive",
    });
  };

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
          <h1 className="text-xl font-semibold">设置</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings2 className="w-4 h-4 mr-2" />
              通用
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-4 h-4 mr-2" />
              外观
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              安全
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lock className="w-4 h-4 mr-2" />
              隐私
            </TabsTrigger>
          </TabsList>

          {/* 通用设置 */}
          <TabsContent value="general" className="space-y-6">
            {/* 通知设置 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  通知设置
                </CardTitle>
                <CardDescription>
                  管理您接收通知的方式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>推送通知</Label>
                    <p className="text-sm text-muted-foreground">接收应用内推送通知</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>邮件通知</Label>
                    <p className="text-sm text-muted-foreground">接收重要更新的邮件通知</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>声音提示</Label>
                    <p className="text-sm text-muted-foreground">播放消息提示音</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 聊天设置 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle>聊天设置</CardTitle>
                <CardDescription>
                  自定义您的聊天体验
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动保存对话</Label>
                    <p className="text-sm text-muted-foreground">自动保存您的对话记录</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>流式响应</Label>
                    <p className="text-sm text-muted-foreground">以打字机效果显示AI回复</p>
                  </div>
                  <Switch
                    checked={settings.streamingMode}
                    onCheckedChange={(checked) => handleSettingChange('streamingMode', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>会话超时时间</Label>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分钟</SelectItem>
                      <SelectItem value="30">30分钟</SelectItem>
                      <SelectItem value="60">1小时</SelectItem>
                      <SelectItem value="120">2小时</SelectItem>
                      <SelectItem value="0">永不超时</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  界面外观
                </CardTitle>
                <CardDescription>
                  自定义应用的外观和感觉
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light", label: "浅色", icon: Sun },
                      { value: "dark", label: "深色", icon: Moon },
                      { value: "auto", label: "自动", icon: Settings2 },
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={settings.theme === value ? "default" : "outline"}
                        onClick={() => handleSettingChange('theme', value)}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>语言</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          简体中文
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>字体大小</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "small", label: "小" },
                      { value: "medium", label: "中" },
                      { value: "large", label: "大" },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={settings.fontSize === value ? "default" : "outline"}
                        onClick={() => handleSettingChange('fontSize', value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="space-y-6">
            {/* 密码修改 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  密码修改
                </CardTitle>
                <CardDescription>
                  定期更换密码以保护账户安全
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-background/60 border-border/60 focus:border-primary transition-colors pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                  className="w-full btn-gradient-soft"
                >
                  {isLoading ? "修改中..." : "修改密码"}
                </Button>
              </CardContent>
            </Card>

            {/* 账户安全 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle>账户安全</CardTitle>
                <CardDescription>
                  管理您的账户安全设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>两步验证</Label>
                    <p className="text-sm text-muted-foreground">
                      为您的账户添加额外的安全保护
                      <Badge variant="outline" className="ml-2">推荐</Badge>
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 隐私设置 */}
          <TabsContent value="privacy" className="space-y-6">
            {/* 隐私控制 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  隐私控制
                </CardTitle>
                <CardDescription>
                  控制您的个人信息可见性
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>公开个人资料</Label>
                    <p className="text-sm text-muted-foreground">允许其他用户查看您的基本信息</p>
                  </div>
                  <Switch
                    checked={settings.profileVisible}
                    onCheckedChange={(checked) => handleSettingChange('profileVisible', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>显示活动状态</Label>
                    <p className="text-sm text-muted-foreground">显示您的在线状态和最后活动时间</p>
                  </div>
                  <Switch
                    checked={settings.activityVisible}
                    onCheckedChange={(checked) => handleSettingChange('activityVisible', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 数据管理 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle>数据管理</CardTitle>
                <CardDescription>
                  管理您的个人数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>导出数据</Label>
                    <p className="text-sm text-muted-foreground">下载您的所有对话记录和文件</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="hover:bg-background/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-red-600">删除账户</Label>
                    <p className="text-sm text-muted-foreground">永久删除您的账户和所有数据</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 数据使用说明 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  数据使用说明
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 我们仅收集必要的个人信息用于提供服务</p>
                <p>• 您的对话数据会被加密存储，我们不会查看或分享</p>
                <p>• 上传的文件仅用于AI分析，处理后会自动删除</p>
                <p>• 您可以随时请求删除个人数据</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

