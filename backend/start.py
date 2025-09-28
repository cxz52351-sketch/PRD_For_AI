#!/usr/bin/env python3
"""
Indus AI Dialogue Forge 后端启动脚本
"""

import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    
    # 检测是否在生产环境（Render）
    is_production = os.getenv("RENDER") is not None
    
    print(f"🚀 启动 Indus AI Dialogue Forge 后端服务器...")
    print(f"📍 服务器地址: http://{host}:{port}")
    print(f"📚 API文档: http://{host}:{port}/docs")
    print(f"🔧 运行模式: {'生产环境' if is_production else '开发环境'}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=not is_production,  # 生产环境禁用 reload
        log_level="info"
    ) 