import re

def fix_conversations_endpoint():
    """修复对话列表端点，添加用户隔离"""
    
    # 读取文件
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 要替换的旧代码
    old_code = '''@app.get("/api/conversations")
async def get_conversations(limit: int = 20, offset: int = 0):
    """获取对话列表"""
    try:
        conversations = await db.get_conversations(limit=limit, offset=offset)
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")'''
    
    # 新的代码
    new_code = '''@app.get("/api/conversations")
async def get_conversations(
    limit: int = 20, 
    offset: int = 0,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """获取对话列表 - 只返回当前用户的对话"""
    try:
        # 如果用户已登录，只返回该用户的对话
        if current_user:
            conversations = await db.get_conversations(
                user_id=current_user.get("id"), 
                limit=limit, 
                offset=offset
            )
        else:
            # 如果用户未登录，返回空列表
            conversations = []
            
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")'''
    
    # 执行替换
    if old_code in content:
        content = content.replace(old_code, new_code)
        
        # 写回文件
        with open('main.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 成功修复对话列表端点 - 现在支持用户隔离")
        return True
    else:
        print("❌ 未找到要替换的代码段")
        print("正在查找相似的代码...")
        
        # 尝试找到类似的模式
        pattern = r'@app\.get\("/api/conversations"\)\s*\nasync def get_conversations\([^}]+?\}'
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            print(f"找到 {len(matches)} 个相似的代码段")
            for i, match in enumerate(matches):
                print(f"匹配 {i+1}:")
                print(match[:200] + "...")
        
        return False

if __name__ == "__main__":
    fix_conversations_endpoint()
