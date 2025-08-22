#!/bin/bash

# 杀掉可能存在的后端进程
echo "🔄 正在停止现有的后端进程..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# 等待端口释放
sleep 2

# 启动后端服务
echo "🚀 启动后端服务..."
cd backend
python start.py &

# 记录进程ID
BACKEND_PID=$!
echo "📋 后端进程ID: $BACKEND_PID"
echo $BACKEND_PID > ../backend.pid

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ 后端服务启动成功!"
    echo "📚 API文档: http://localhost:8001/docs"
else
    echo "❌ 后端服务启动失败"
    exit 1
fi
