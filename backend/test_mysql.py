# 创建 backend/test_mysql.py
import asyncio
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv("1.env")

async def test_mysql_connection():
    """测试MySQL连接和基本操作"""
    try:
        print("🔍 开始测试MySQL连接...")
        
        # 检查环境变量
        print(f"MySQL Host: {os.getenv('MYSQL_HOST')}")
        print(f"MySQL Database: {os.getenv('MYSQL_DATABASE')}")
        print(f"MySQL User: {os.getenv('MYSQL_USER')}")
        print(f"Use MySQL: {os.getenv('USE_MYSQL')}")
        
        # 导入MySQL模块
        import db_mysql as db
        
        # 测试1: 连接池创建
        print("\n🔧 测试1: 创建连接池...")
        pool = await db.get_pool()
        print("✅ 连接池创建成功")
        
        # 测试2: 数据库初始化
        print("\n🔧 测试2: 初始化数据库表...")
        await db.init_db()
        print("✅ 数据库表初始化成功")
        
        # 测试3: 基本查询
        print("\n🔧 测试3: 测试基本查询...")
        stats = await db.get_stats()
        print(f"✅ 统计查询成功: {stats}")
        
        # 测试4: 创建测试用户
        print("\n🔧 测试4: 创建测试用户...")
        test_user_id = await db.create_user(
            username="test_mysql_user",
            email="mysql_test@example.com", 
            phone="13800000000",
            password_hash="test_hash"
        )
        print(f"✅ 测试用户创建成功: {test_user_id}")
        
        # 测试5: 查询用户
        print("\n🔧 测试5: 查询测试用户...")
        user = await db.get_user_by_email("mysql_test@example.com")
        print(f"✅ 用户查询成功: {user['username'] if user else 'None'}")
        
        # 测试6: 创建对话
        print("\n🔧 测试6: 创建测试对话...")
        conv_id = await db.create_conversation(
            title="MySQL测试对话",
            model="gpt-3.5-turbo",
            user_id=test_user_id
        )
        print(f"✅ 对话创建成功: {conv_id}")
        
        # 测试7: 添加消息
        print("\n🔧 测试7: 添加测试消息...")
        msg_id = await db.add_message(
            conversation_id=conv_id,
            role="user", 
            content="这是MySQL测试消息"
        )
        print(f"✅ 消息添加成功: {msg_id}")
        
        # 测试8: 复制统计
        print("\n🔧 测试8: 测试复制统计...")
        copy_success = await db.record_message_copy(msg_id)
        copy_stats = await db.get_message_copy_stats(msg_id)
        print(f"✅ 复制统计成功: {copy_success}, 统计: {copy_stats}")
        
        print("\n🎉 所有MySQL测试通过！数据库配置成功！")
        return True
        
    except Exception as e:
        print(f"\n❌ MySQL测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_mysql_connection())