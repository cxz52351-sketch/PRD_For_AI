# PRD For AI - Chrome Extension

AI Coding的需求扩写小帮手 - Chrome浏览器插件版本

## 🚀 项目简介

PRD For AI 是一个专为 AI Coding 设计的 Chrome 浏览器插件，帮助开发者快速扩写和完善产品需求文档（PRD）。通过集成先进的 AI 模型，可以将简单的应用想法扩展成详细的产品需求文档。

## ✨ 主要功能

- 🤖 **智能PRD生成**：输入简单的应用想法，自动生成详细的产品需求文档
- 🖥️ **侧边栏界面**：在浏览器侧边栏中便捷使用，不打断当前工作流程
- 📝 **流式生成**：实时显示AI生成的内容，提供流畅的用户体验
- 📋 **一键复制**：生成的PRD可以一键复制到剪贴板
- 🔄 **对话记忆**：支持多轮对话，可以进一步完善需求文档

## 🏗️ 技术架构

### Chrome插件前端
- **HTML/CSS/JavaScript**：原生web技术实现
- **Chrome Extension API**：使用Manifest V3标准
- **Side Panel API**：浏览器侧边栏集成

### 后端API服务
- **FastAPI**：现代Python Web框架
- **Dify工作流**：集成AI模型服务
- **SQLite**：本地数据存储
- **流式响应**：支持实时内容生成

## 🛠️ 安装和使用

### 1. 启动后端服务

```bash
# 安装后端依赖
cd backend
pip install -r requirements.txt

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，设置 DIFY_API_KEY

# 启动后端服务
python start.py
```

### 2. 构建Chrome插件

```bash
# 安装依赖（可选，用于构建）
npm install

# 构建插件（可选）
npm run build

# 或者直接使用public目录下的文件
```

### 3. 加载Chrome插件

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `public` 目录（或构建后的 `dist` 目录）

### 4. 使用插件

1. 点击Chrome工具栏中的插件图标
2. 在侧边栏中输入你的应用想法
3. 点击"生成PRD"按钮
4. 等待AI生成详细的产品需求文档
5. 使用"一键复制"功能复制内容

## 📁 项目结构

```
├── backend/              # 后端API服务
│   ├── main.py          # FastAPI主应用
│   ├── db.py            # 数据库操作
│   ├── requirements.txt # Python依赖
│   └── start.py         # 启动脚本
├── public/              # Chrome插件文件
│   ├── manifest.json    # 插件清单
│   ├── sidepanel.html   # 侧边栏HTML
│   ├── sidepanel.js     # 侧边栏逻辑
│   ├── sidepanel.css    # 侧边栏样式
│   └── *.svg/*.png      # 图标文件
└── README.md           # 项目说明
```

## ⚙️ 配置说明

### 后端配置
在 `backend/.env` 文件中配置：
```env
DIFY_API_BASE=http://teach.excelmaster.ai/v1
DIFY_API_KEY=your_dify_api_key
DIFY_API_CHANNEL=workflow
```

### Chrome插件权限
插件需要以下权限：
- `activeTab`: 访问当前标签页
- `sidePanel`: 使用侧边栏API
- `storage`: 本地存储
- 访问后端API的host权限

## 🔧 开发说明

### 本地开发
1. 启动后端服务（端口8001）
2. 直接编辑 `public/` 目录下的文件
3. 在Chrome中重新加载插件查看更改

### API集成
插件通过以下端点与后端通信：
- `POST /api/chat` - 发送PRD生成请求
- `GET /health` - 健康检查

## 📝 使用示例

**输入示例：**
```
我想做一个LLM对话应用
```

**生成的PRD包含：**
- 项目概述和目标
- 功能需求列表
- 技术架构建议
- 用户界面设计要求
- 开发计划和里程碑

## 🆘 故障排除

### 常见问题
1. **插件无法加载**：检查manifest.json语法是否正确
2. **API请求失败**：确认后端服务已启动并运行在正确端口
3. **生成失败**：检查.env文件中的API密钥配置
4. **侧边栏不显示**：确认Chrome版本支持Side Panel API

### 调试方法
1. 打开Chrome开发者工具
2. 在插件管理页面点击"检查视图"
3. 查看控制台错误信息
4. 检查网络请求状态

## 📞 技术支持

如遇到问题，请：
1. 检查控制台错误日志
2. 确认后端服务运行状态
3. 验证API密钥配置
4. 查看Chrome插件权限设置

---

🎉 **现在您可以在Chrome浏览器中随时使用AI助手来扩写产品需求文档了！**