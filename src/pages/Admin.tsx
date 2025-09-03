import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, Calendar, Mail, Phone, User, Eye } from "lucide-react";
import { api, APIError, UserData, Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface UserStats {
  conversations: number;
  messages: number;
}

interface UserWithStats extends UserData {
  stats?: UserStats;
  conversations?: Conversation[];
}

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查管理员权限
  const isAdmin = user?.email === "490429443@qq.com";

  useEffect(() => {
    console.log("当前用户:", user);
    console.log("是否为管理员:", isAdmin);

    if (!user) {
      console.log("用户未登录，跳转到登录页");
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      console.log("权限不足，当前用户邮箱:", user.email);
      setError("权限不足：只有管理员可以访问此页面");
      return;
    }

    console.log("权限验证通过，开始加载用户数据");
    loadUsers();
  }, [user, isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("开始加载用户列表...");

      // 检查Token
      const token = localStorage.getItem('auth_token');
      console.log("当前Token:", token ? `${token.substring(0, 20)}...` : '无Token');

      const response = await api.admin.getUsers(100, 0);
      console.log("API响应:", response);
      setUsers(response.users);
    } catch (err) {
      console.error("加载用户列表失败:", err);
      if (err instanceof APIError) {
        setError(`API错误 (${err.status}): ${err.message}`);
      } else {
        setError(`加载用户列表失败: ${err.message || err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId: string) => {
    try {
      setDetailLoading(true);
      const response = await api.admin.getUserDetail(userId);
      const userWithDetail = {
        ...response.user,
        stats: response.stats,
        conversations: response.conversations
      };
      setSelectedUser(userWithDetail);

      // 更新用户列表中的统计信息
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, stats: response.stats, conversations: response.conversations }
            : u
        )
      );
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("加载用户详情失败");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (!user) {
    return <div>请先登录...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              权限不足：只有管理员（490429443@qq.com）可以访问此页面
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/")} variant="outline">
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto pt-4">
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">用户与会话管理</h1>
              <p className="text-gray-600 mt-1">管理所有用户及其对话记录</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-purple-600">
                管理员
              </Badge>
              <Button onClick={() => navigate("/")} variant="outline">
                返回首页
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              用户列表
            </TabsTrigger>
            <TabsTrigger value="detail" className="flex items-center gap-2" disabled={!selectedUser}>
              <Eye className="h-4 w-4" />
              用户详情
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/50 backdrop-blur-sm border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? <Skeleton className="h-8 w-16" /> : users.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">有邮箱用户</CardTitle>
                  <Mail className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? <Skeleton className="h-8 w-16" /> : users.filter(u => u.email).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">有手机号用户</CardTitle>
                  <Phone className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? <Skeleton className="h-8 w-16" /> : users.filter(u => u.phone).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 用户列表 */}
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>点击用户查看详细信息</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[160px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => loadUserDetail(user.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-purple-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{user.username}</span>
                              {user.email === "490429443@qq.com" && (
                                <Badge variant="default" className="bg-purple-600 text-xs">
                                  管理员
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </span>
                              )}
                              {user.phone && (
                                <span className="flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.created_at)}
                          </div>
                          {user.stats && (
                            <div className="flex items-center gap-1 mt-1">
                              <MessageSquare className="h-3 w-3" />
                              {user.stats.conversations} 对话
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {selectedUser && (
              <div className="space-y-6">
                {/* 用户基本信息 */}
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      用户详情
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {detailLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">用户名</label>
                            <div className="mt-1 text-gray-900">{selectedUser.username}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">邮箱</label>
                            <div className="mt-1 text-gray-900">{selectedUser.email || "未设置"}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">手机号</label>
                            <div className="mt-1 text-gray-900">{selectedUser.phone || "未设置"}</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">注册时间</label>
                            <div className="mt-1 text-gray-900">{formatDate(selectedUser.created_at)}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">对话数量</label>
                            <div className="mt-1 text-gray-900">{selectedUser.stats?.conversations || 0}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">消息数量</label>
                            <div className="mt-1 text-gray-900">{selectedUser.stats?.messages || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 对话列表 */}
                {selectedUser.conversations && selectedUser.conversations.length > 0 && (
                  <Card className="bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        对话记录
                      </CardTitle>
                      <CardDescription>
                        该用户共有 {selectedUser.conversations.length} 条对话记录
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedUser.conversations.map((conversation) => (
                          <div key={conversation.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{conversation.title}</div>
                                <div className="text-sm text-gray-500">
                                  模型: {conversation.model}
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>创建: {formatDate(conversation.created_at)}</div>
                                <div>更新: {formatDate(conversation.updated_at)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
