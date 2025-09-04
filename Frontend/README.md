# PRD For AI - 前端项目

这是PRD For AI项目的前端应用，基于React + Vite + TypeScript + Tailwind CSS构建。

## 🚀 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库
- **React Router** - 路由管理
- **React Hook Form** - 表单处理
- **React Markdown** - Markdown渲染
- **Mermaid** - 流程图渲染

## 📁 项目结构

```
src/
├── components/         # 可复用组件
│   ├── ui/            # 基础UI组件
│   ├── ChatInterface.tsx    # 聊天界面
│   ├── ChatMessage.tsx      # 消息组件
│   ├── CanvasEdit.tsx       # 画布编辑
│   ├── ChatSidebar.tsx      # 侧边栏
│   ├── UserMenu.tsx         # 用户菜单
│   └── ...
├── pages/             # 页面组件
│   ├── Index.tsx      # 主页面
│   ├── Login.tsx      # 登录页
│   ├── Register.tsx   # 注册页
│   ├── Admin.tsx      # 管理员页面
│   ├── Profile.tsx    # 用户资料
│   └── Settings.tsx   # 设置页面
├── lib/               # 工具库
│   ├── api.ts         # API调用
│   ├── auth.tsx       # 认证逻辑
│   ├── i18n.ts        # 国际化
│   └── utils.ts       # 工具函数
├── hooks/             # 自定义Hook
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── App.tsx            # 应用入口
```

## 🔧 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 🌐 API配置

前端会根据环境自动选择API地址：
- **开发环境**: http://localhost:8001
- **生产环境**: https://prd-for-ai.onrender.com

## 🚀 部署

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel导入仓库
3. 配置构建设置：
   - **框架预设**: Vite
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **Node版本**: 18+

### 构建配置

- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **Node版本**: 18+

## ✨ 主要功能

- 📝 **对话聊天** - AI助手对话功能
- 🎨 **画布编辑** - 可视化编辑和预览
- 👥 **用户管理** - 注册、登录、资料管理
- 🔐 **权限控制** - 管理员权限和用户隔离
- 📊 **统计监控** - 用户行为和复制统计
- 🌍 **多语言** - 中英文切换支持
- 📱 **响应式** - 移动端适配
- 🎯 **实时交互** - 流式响应和实时更新

## 🔗 相关链接

- **生产地址**: https://prd-for-ai.vercel.app
- **自定义域名**: https://www.llm-prd.xin
- **后端API**: https://prd-for-ai.onrender.com
- **GitHub**: [链接待补充]

## 📝 环境变量

无需配置额外的环境变量，API地址会自动根据部署环境切换。

## 🔧 开发说明

### API通信

前端通过 `src/lib/api.ts` 与后端通信，支持：
- 用户认证（注册、登录、验证）
- 对话管理（创建、获取、删除）
- 消息处理（发送、获取、复制统计）
- 管理员功能（用户管理、统计查看）

### 状态管理

- **用户状态**: 通过 `AuthContext` 管理
- **对话状态**: 组件内 `useState` 管理
- **主题状态**: `next-themes` 管理

### 样式系统

- 基于 Tailwind CSS
- 使用 shadcn/ui 组件库
- 支持明暗主题切换
- 响应式设计

## 🛠️ 维护指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `src/App.tsx` 添加路由
3. 更新导航菜单（如需要）

### 添加新API

1. 在 `src/lib/api.ts` 添加新函数
2. 定义相关TypeScript类型
3. 在组件中调用

### 更新依赖

```bash
# 检查过时依赖
npm outdated

# 更新依赖
npm update

# 安全更新
npm audit fix
```

---

**重构完成！** 这个前端项目现在是完全独立的，可以独立开发、构建和部署。 🎉
