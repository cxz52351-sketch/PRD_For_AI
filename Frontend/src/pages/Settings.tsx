import { useState, useEffect } from "react";
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
import { useTranslation } from "@/lib/useLanguage";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // 同步语言状态
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      language: language === 'zh' ? 'zh-CN' : 'en-US'
    }));
  }, [language]);

  // 设置状态
  const [settings, setSettings] = useState({
    // 外观设置
    theme: "auto", // light, dark, auto
    language: language === 'zh' ? 'zh-CN' : 'en-US', // 转换为设置格式
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

    // 如果是语言设置，同时更新翻译系统
    if (key === 'language') {
      setLanguage(value === 'zh-CN' ? 'zh' : 'en');
    }

    // 模拟保存设置
    toast({
      title: t.settings.saved,
      description: t.settings.autoSaved,
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
      title: t.settings.exportRequestSubmitted,
      description: t.settings.exportDataDescription,
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: t.common.developing,
      description: t.settings.deleteAccountDeveloping,
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
            onClick={() => navigate('/app')}
            className="hover:bg-background/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
          <h1 className="text-xl font-semibold">{t.common.settings}</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings2 className="w-4 h-4 mr-2" />
              {t.settings.general}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-4 h-4 mr-2" />
              {t.settings.appearance}
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              {t.settings.security}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lock className="w-4 h-4 mr-2" />
              {t.settings.privacy}
            </TabsTrigger>
          </TabsList>

          {/* 通用设置 */}
          <TabsContent value="general" className="space-y-6">
            {/* 通知设置 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t.settings.notificationSettings}
                </CardTitle>
                <CardDescription>
                  {t.settings.manageNotifications}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.pushNotifications}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.receivePushNotifications}</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.emailNotifications}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.receiveEmailNotifications}</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.soundAlerts}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.playMessageSounds}</p>
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
                <CardTitle>{t.settings.chatSettings}</CardTitle>
                <CardDescription>
                  {t.settings.customizeChat}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.autoSaveConversations}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.autoSaveHistory}</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.streamingResponse}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.typewriterEffect}</p>
                  </div>
                  <Switch
                    checked={settings.streamingMode}
                    onCheckedChange={(checked) => handleSettingChange('streamingMode', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t.settings.sessionTimeout}</Label>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {t.settings.minutes}</SelectItem>
                      <SelectItem value="30">30 {t.settings.minutes}</SelectItem>
                      <SelectItem value="60">1 {t.settings.hour}</SelectItem>
                      <SelectItem value="120">2 {t.settings.hours}</SelectItem>
                      <SelectItem value="0">{t.settings.neverTimeout}</SelectItem>
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
                  {t.settings.interfaceAppearance}
                </CardTitle>
                <CardDescription>
                  {t.settings.customizeAppearance}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.settings.themeMode}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light", label: t.settings.light, icon: Sun },
                      { value: "dark", label: t.settings.dark, icon: Moon },
                      { value: "auto", label: t.settings.auto, icon: Settings2 },
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
                  <Label>{t.common.language}</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {t.settings.simplifiedChinese}
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {t.settings.english}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>{t.settings.fontSize}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "small", label: t.settings.small },
                      { value: "medium", label: t.settings.medium },
                      { value: "large", label: t.settings.large },
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
                  {t.settings.changePassword}
                </CardTitle>
                <CardDescription>
                  {t.settings.changePasswordDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t.settings.currentPassword}</Label>
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
                  <Label htmlFor="new-password">{t.settings.newPassword}</Label>
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
                  <Label htmlFor="confirm-password">{t.settings.confirmNewPassword}</Label>
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
                  {isLoading ? t.settings.changingPassword : t.settings.changePassword}
                </Button>
              </CardContent>
            </Card>

            {/* 账户安全 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50">
              <CardHeader>
                <CardTitle>{t.settings.accountSecurity}</CardTitle>
                <CardDescription>
                  {t.settings.manageAccountSecurity}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.twoFactorAuth}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.twoFactorAuthDescription}
                      <Badge variant="outline" className="ml-2">{t.settings.recommended}</Badge>
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
                  {t.settings.privacyControl}
                </CardTitle>
                <CardDescription>
                  {t.settings.controlVisibility}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.publicProfile}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.allowOthersView}</p>
                  </div>
                  <Switch
                    checked={settings.profileVisible}
                    onCheckedChange={(checked) => handleSettingChange('profileVisible', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.showActivityStatus}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.showOnlineStatus}</p>
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
                <CardTitle>{t.settings.dataManagement}</CardTitle>
                <CardDescription>
                  {t.settings.managePersonalData}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.exportData}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.downloadAllRecords}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="hover:bg-background/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t.settings.exportData}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-red-600">{t.settings.deleteAccount}</Label>
                    <p className="text-sm text-muted-foreground">{t.settings.permanentlyDeleteAccount}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.settings.deleteAccount}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 数据使用说明 */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-lg border border-border/50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t.settings.dataUsageInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• {t.settings.dataUsageDescription1}</p>
                <p>• {t.settings.dataUsageDescription2}</p>
                <p>• {t.settings.dataUsageDescription3}</p>
                <p>• {t.settings.dataUsageDescription4}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

