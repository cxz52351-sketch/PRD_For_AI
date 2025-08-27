#!/bin/bash

echo "🚀 启动 PRD For AI Chrome插件后端服务..."

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

echo "✅ 环境检查通过"

# 检查后端依赖
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ 错误: 未找到 backend/requirements.txt"
    exit 1
fi

# 检查后端 .env 文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告: 未找到 backend/.env 文件"
    echo "📝 请创建 backend/.env 文件并设置 DIFY_API_KEY"
    echo "💡 参考 backend/env.example 文件"
    
    # 创建示例 .env 文件
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "📄 已创建 backend/.env 文件，请编辑并设置您的 API 密钥"
    fi
fi

# 安装后端依赖
echo "🐍 安装后端依赖..."
cd backend
pip install -r requirements.txt

echo "🎉 依赖安装完成！"
echo ""
echo "📋 下一步操作："
echo "1. 编辑 backend/.env 文件，设置您的 DIFY_API_KEY"
echo "2. 启动后端服务："
echo "   python start.py"
echo ""
echo "📦 加载Chrome插件："
echo "1. 打开Chrome浏览器访问 chrome://extensions/"
echo "2. 开启'开发者模式'"
echo "3. 点击'加载已解压的扩展程序'"
echo "4. 选择项目的 public 目录"
echo ""
echo "🌐 服务地址："
echo "   后端API: http://localhost:8001"
echo "   API文档: http://localhost:8001/docs"
echo ""

# 询问是否立即启动后端服务
read -p "是否立即启动后端服务？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 启动后端服务..."
    python start.py
fi