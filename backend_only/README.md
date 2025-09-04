# PRD For AI - 后端服务

这是PRD For AI项目的纯后端服务，使用FastAPI + MySQL构建。

## 部署到Render

### 方法1：使用GitHub自动部署

1. 将此`backend_only`文件夹上传到新的GitHub仓库
2. 在Render控制台创建新的Web Service
3. 连接到GitHub仓库
4. 设置环境变量（见下方）
5. 自动部署

### 方法2：手动上传

1. 将此文件夹打包上传到Render
2. 设置环境变量
3. 部署

## 环境变量配置

在Render的Environment标签中设置：

```
USE_MYSQL=true
MYSQL_HOST=bdm721874380.my3w.com
MYSQL_PORT=3306
MYSQL_DATABASE=bdm721874380_db
MYSQL_USER=bdm721874380
MYSQL_PASSWORD=i3L4M5eUBxCq@Pv
DIFY_API_KEY=app-5zA5RoIpzA3isrshEQnWbvmq
DIFY_API_BASE=http://teach.excelmaster.ai/v1
DIFY_API_CHANNEL=chat
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

## API端点

- `GET /health` - 健康检查
- `GET /api/db-status` - 数据库状态检查
- `POST /api/chat` - 聊天接口
- `GET /api/admin/users` - 管理员：用户列表
- 更多API详见代码

## 前端配置

前端应该指向此后端的URL：
```javascript
const API_BASE_URL = 'https://your-render-backend-url.onrender.com'
```

## 测试

部署后可以访问：
- `https://your-backend-url.onrender.com/health`
- `https://your-backend-url.onrender.com/api/db-status`

确认返回状态为正常。
