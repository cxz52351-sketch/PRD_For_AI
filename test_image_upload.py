#!/usr/bin/env python3
"""
测试图片上传到 Dify API 的功能
"""
import requests
import json
import base64

# API 端点
API_BASE = "http://localhost:8001"

def create_test_base64_image():
    """创建一个简单的测试图片 (1x1 像素的 PNG)"""
    # 这是一个 1x1 透明 PNG 的 base64 数据
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    return "data:image/png;base64," + base64.b64encode(png_data).decode()

def test_image_chat():
    """测试包含图片的聊天请求"""
    
    # 创建测试用的base64图片
    test_image = create_test_base64_image()
    
    # 构建聊天请求
    chat_request = {
        "messages": [
            {
                "role": "user",
                "content": "你能看到这个图片吗？请描述一下。"
            }
        ],
        "model": "deepseek-chat",
        "stream": False,
        "files": [
            {
                "type": "image",
                "transfer_method": "local_file",
                "url": test_image,
                "name": "test.png",
                "mime_type": "image/png"
            }
        ]
    }
    
    print("发送带有图片的聊天请求...")
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
                print(f"AI 回复: {content[:200]}...")
            else:
                print("❌ 响应格式不正确")
                print(json.dumps(data, ensure_ascii=False, indent=2)[:500])
        else:
            print("❌ 请求失败")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

if __name__ == "__main__":
    print("测试图片上传功能...")
    test_image_chat()