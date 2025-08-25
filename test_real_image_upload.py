#!/usr/bin/env python3
"""
测试实际图片上传到 Dify API 的功能
"""
import requests
import json
import base64
from PIL import Image
from io import BytesIO

# API 端点
API_BASE = "http://localhost:8001"

def create_test_image():
    """创建一个简单的测试图片并转换为 base64"""
    # 创建一个 100x100 的红色图片
    image = Image.new('RGB', (100, 100), color='red')
    
    # 将图片保存到 BytesIO 对象
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    
    # 转换为 base64
    img_data = buffer.getvalue()
    base64_str = base64.b64encode(img_data).decode()
    data_url = f"data:image/png;base64,{base64_str}"
    
    return data_url

def test_image_chat():
    """测试包含图片的聊天请求"""
    
    # 创建测试图片
    test_image = create_test_image()
    
    # 构建聊天请求
    chat_request = {
        "messages": [
            {
                "role": "user",
                "content": "你能看到这个图片吗？请描述一下图片内容。"
            }
        ],
        "model": "deepseek-chat",
        "stream": False,
        "files": [
            {
                "type": "image",
                "transfer_method": "local_file",
                "url": test_image,
                "name": "test_red_square.png",
                "mime_type": "image/png"
            }
        ]
    }
    
    print("发送带有实际图片的聊天请求...")
    print(f"图片数据长度: {len(test_image)} 字符")
    
    try:
        response = requests.post(
            f"{API_BASE}/api/chat",
            json=chat_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 请求成功!")
            
            if 'choices' in data and data['choices']:
                content = data['choices'][0]['message']['content']
                print(f"AI 回复: {content[:300]}...")
            else:
                print("❌ 响应格式不正确")
                print(json.dumps(data, ensure_ascii=False, indent=2)[:500])
        else:
            print("❌ 请求失败")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

if __name__ == "__main__":
    print("测试实际图片上传功能...")
    test_image_chat()