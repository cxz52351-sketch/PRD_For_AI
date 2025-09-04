#!/bin/bash

echo "🚀 启动 Indus AI Dialogue Forge 前后端分离系统..."
echo ""

# 检查环境
echo "🔍 检查环境..."

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 检查并安装后端依赖
echo "🐍 检查后端依赖..."
cd backend
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 未找到 backend/requirements.txt"
    exit 1
fi

# 检查环境变量配置
if [ ! -f ".env" ] && [ ! -f "1.env" ]; then
    echo "⚠️  警告: 未找到环境变量配置文件"
    echo "📝 请确保 backend/.env 或 backend/1.env 文件存在并配置了 DIFY_API_KEY"
    if [ -f "env.example" ]; then
        echo "💡 可以参考 backend/env.example 文件"
    fi
fi

echo "📦 安装后端依赖..."
pip install -r requirements.txt
cd ..

# 检查并安装前端依赖
echo ""
echo "📦 检查前端依赖..."
cd Frontend
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到 Frontend/package.json"
    exit 1
fi

echo "📦 安装前端依赖..."
npm install
cd ..

echo ""
echo "🎉 依赖安装完成！"
echo ""

# 启动服务
echo "🚀 启动后端服务..."
cd backend
python start.py &
BACKEND_PID=$!
echo "📋 后端进程ID: $BACKEND_PID"
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端服务状态
if curl -s http://localhost:8001/docs > /dev/null; then
    echo "✅ 后端服务启动成功!"
else
    echo "⚠️  后端服务可能未完全启动，请检查日志"
fi

echo ""
echo "🚀 启动前端服务..."
cd Frontend
npm run dev &
FRONTEND_PID=$!
echo "📋 前端进程ID: $FRONTEND_PID"
cd ..

echo ""
echo "🎉 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "   📱 前端应用: http://localhost:8081"
echo "   🔧 后端API: http://localhost:8001"
echo "   📚 API文档: http://localhost:8001/docs"
echo ""
echo "🛑 停止服务："
echo "   按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 服务已停止"; exit 0' INT

# 保持脚本运行
wait
