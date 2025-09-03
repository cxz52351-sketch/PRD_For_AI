import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/useLanguage';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: t.user.logoutSuccess.split('您已成功')[0].trim(),
      description: t.user.logoutSuccess,
    });
  };

  if (!user) {
    return null;
  }

  // 获取用户名首字母作为头像回退
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 格式化显示名称
  const getDisplayName = () => {
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    if (user.phone) return `${t.user.userPrefix}${user.phone.slice(-4)}`;
    return t.user.userPrefix;
  };

  // 获取联系方式显示
  const getContactInfo = () => {
    if (user.email) return user.email;
    if (user.phone) return user.phone;
    return 'ID: ' + user.id.slice(-8);
  };

  // 检查是否为管理员
  const isAdmin = user.email === "490429443@qq.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-background/10">
          <Avatar className="h-10 w-10 border-2 border-border/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-medium">
              {getInitials(getDisplayName())}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getContactInfo()}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>{t.user.profile}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>{t.user.settings}</span>
        </DropdownMenuItem>

        {/* 管理员菜单项 */}
        {isAdmin && (
          <DropdownMenuItem
            className="cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50"
            onClick={() => navigate('/admin')}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>用户管理</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.user.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
