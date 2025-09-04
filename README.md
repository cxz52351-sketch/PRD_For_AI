# Indus AI Dialogue Forge

一个基于 Dify 工作流的工业级智能对话系统，集成完整的用户认证功能，提供智能对话、代码生成和文件分析功能。

## 🚀 项目特色

- ✅ **完整用户认证系统** - 支持邮箱/手机号注册登录
- ✅ **路由保护机制** - 智能页面跳转和权限控制  
- ✅ **现代化UI设计** - 基于 shadcn/ui 的精美界面
- ✅ **实时流式对话** - 支持打字机效果的AI回复
- ✅ **多格式文件支持** - 上传分析PDF、Word、图片等
- ✅ **对话历史管理** - 完整的会话记录和导出功能

## 项目信息

**URL**: https://lovable.dev/projects/ffd3923b-c18c-4a40-91d9-229fe1965e7a

## 🚀 快速开始

### 一键启动 (推荐)

**前后端一键启动 (推荐):**
```bash
chmod +x start-frontend-backend.sh
./start-frontend-backend.sh
```

**分别启动:**
```bash
# 启动后端服务
chmod +x start_backend.sh
./start_backend.sh

# 启动前端服务 (新终端)
cd Frontend
npm run dev
```

**完整一键启动 (Windows):**
```cmd
start.bat
```

**完整一键启动 (Linux/Mac):**
```bash
chmod +x start.sh
./start.sh
```

### 手动启动

1. **安装依赖**
   ```bash
   # 前端依赖
   cd Frontend
   npm install
   cd ..
   
   # 后端依赖
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

2. **配置环境变量**
   - 复制 `backend/env.example` 为 `backend/.env`
   - 在 `.env` 或 `backend/1.env` 中设置：
     ```
     DIFY_API_BASE=http://teach.excelmaster.ai/v1
     DIFY_API_KEY=app-wiFSsheVuALpQ5cN7LrPv5Lb
     ```

3. **启动服务**
   ```bash
   # 启动后端 (终端1)
   cd backend
   python start.py
   
   # 启动前端 (终端2)
   cd Frontend
   npm run dev
   ```

4. **访问应用**
   - 前端: http://localhost:8082 (或 8081，取决于端口占用情况)
   - 后端API: http://localhost:8001
   - API文档: http://localhost:8001/docs

## 🔐 用户认证功能

### 功能特点
- **双登录方式**: 支持邮箱或手机号登录
- **密码强度验证**: 注册时要求密码包含大小写字母、数字，至少8位
- **安全认证**: 使用JWT Token，支持过期自动处理
- **路由保护**: 未登录用户自动跳转到登录页
- **用户界面**: 集成用户头像菜单和退出登录功能

### 使用流程
1. **首次访问**: 未登录用户访问主页 → 自动跳转到登录页
2. **用户注册**: 填写用户名、邮箱/手机号、密码 → 注册成功后自动登录
3. **用户登录**: 使用邮箱/手机号和密码登录 → 跳转到主页
4. **退出登录**: 点击用户头像 → 退出登录 → 返回登录页

### 测试账户
- 邮箱: `test123@example.com`
- 密码: `TestPassword123`

## 📚 技术架构

### 前端技术栈
- **React 18** - 现代React框架
- **TypeScript** - 类型安全开发
- **Tailwind CSS** - 原子化CSS框架
- **shadcn/ui** - 高质量UI组件库
- **React Router** - 路由管理
- **Tanstack Query** - 数据状态管理

### 后端技术栈
- **FastAPI** - 现代Python Web框架
- **SQLite** - 轻量级数据库
- **JWT** - 安全认证
- **bcrypt** - 密码加密
- **Dify API** - AI对话能力

### 项目结构
```
PRD_For_AI_cc/
├── Frontend/              # 前端源代码
│   ├── src/              # React源码
│   │   ├── components/   # React组件
│   │   ├── pages/       # 页面组件
│   │   ├── lib/         # 工具库
│   │   └── hooks/       # 自定义Hook
│   ├── package.json     # 前端依赖配置
│   └── vite.config.ts   # Vite配置
├── backend/              # 后端源代码
│   ├── main.py          # FastAPI主应用
│   ├── auth.py          # 认证模块
│   ├── db.py            # 数据库模块
│   ├── start.py         # 启动脚本
│   └── requirements.txt # 后端依赖配置
└── README.md            # 项目文档
```

## 🛠️ 开发指南

### 本地开发环境

**前端开发**
```bash
# 进入前端目录
cd Frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

**后端开发**
```bash
# 进入后端目录
cd backend

# 安装Python依赖
pip install -r requirements.txt

# 启动开发服务器
python start.py
```

### 环境配置

**后端环境变量** (在 `backend/.env` 中配置)
```env
DIFY_API_BASE=http://teach.excelmaster.ai/v1
DIFY_API_KEY=your-dify-api-key
JWT_SECRET_KEY=your-jwt-secret-key
```

**前端环境变量** (可选)
```env
VITE_API_BASE_URL=http://localhost:8001
```

## 🚀 部署指南

### 使用 Lovable 部署
1. 访问 [Lovable Project](https://lovable.dev/projects/ffd3923b-c18c-4a40-91d9-229fe1965e7a)
2. 点击 Share -> Publish 进行部署

### 手动部署
- **前端**: 可部署到 Vercel、Netlify 等静态站点服务
- **后端**: 可部署到 Railway、Render、AWS 等云服务

## 📞 技术支持

如遇到问题，请：
1. 查看控制台错误日志
2. 检查网络连接和API配置
3. 验证环境变量设置
4. 提交 Issue 或联系技术支持

---

**🎉 感谢使用 Indus AI Dialogue Forge！**
