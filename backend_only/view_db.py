#!/usr/bin/env python3
"""
数据库查看工具
用于查看SQLite数据库中存储的对话数据
"""

import sqlite3
import json
import os
from datetime import datetime

def view_database():
    """查看数据库内容"""
    db_path = "dialogue_forge.db"
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件 {db_path} 不存在")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("🗄️  Indus AI Dialogue Forge 数据库内容查看器")
        print("=" * 80)
        
        # 查看表结构
        print("\n📋 数据库表结构:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for table in tables:
            print(f"  ✅ {table[0]}")
        
        # 查看对话统计
        print("\n📊 数据统计:")
        cursor.execute("SELECT COUNT(*) FROM conversations")
        conv_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM messages")
        msg_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM attachments")
        attach_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM generated_files")
        file_count = cursor.fetchone()[0]
        
        print(f"  💬 对话数量: {conv_count}")
        print(f"  💭 消息数量: {msg_count}")
        print(f"  📎 附件数量: {attach_count}")
        print(f"  📄 生成文件数量: {file_count}")
        
        # 查看对话列表
        print("\n💬 对话列表:")
        cursor.execute("""
            SELECT id, title, created_at, updated_at, model 
            FROM conversations 
            ORDER BY updated_at DESC
        """)
        conversations = cursor.fetchall()
        
        if conversations:
            for i, conv in enumerate(conversations, 1):
                print(f"\n  🔸 对话 {i}:")
                print(f"     ID: {conv[0]}")
                print(f"     标题: {conv[1]}")
                print(f"     模型: {conv[4]}")
                print(f"     创建时间: {conv[2]}")
                print(f"     更新时间: {conv[3]}")
                
                # 查看该对话的消息
                cursor.execute("""
                    SELECT role, content, created_at 
                    FROM messages 
                    WHERE conversation_id = ? 
                    ORDER BY created_at ASC
                """, (conv[0],))
                messages = cursor.fetchall()
                
                print(f"     📝 消息数量: {len(messages)}")
                for j, msg in enumerate(messages, 1):
                    role_emoji = "👤" if msg[0] == "user" else "��" if msg[0] == "assistant" else "📝"
                    content_preview = msg[1][:100] + "..." if len(msg[1]) > 100 else msg[1]
                    print(f"       {j}. {role_emoji} {msg[0]}: {content_preview}")
                    print(f"           时间: {msg[2]}")
        else:
            print("  ⚠️  暂无对话数据")
        
        # 查看附件
        print("\n📎 附件列表:")
        cursor.execute("""
            SELECT a.filename, a.mime_type, a.created_at, m.content
            FROM attachments a
            JOIN messages m ON a.message_id = m.id
            ORDER BY a.created_at DESC
        """)
        attachments = cursor.fetchall()
        
        if attachments:
            for i, attach in enumerate(attachments, 1):
                print(f"  📎 附件 {i}:")
                print(f"     文件名: {attach[0]}")
                print(f"     类型: {attach[1]}")
                print(f"     上传时间: {attach[2]}")
                content_preview = attach[3][:50] + "..." if len(attach[3]) > 50 else attach[3]
                print(f"     关联消息: {content_preview}")
        else:
            print("  ⚠️  暂无附件数据")
        
        # 查看生成的文件
        print("\n�� 生成的文件列表:")
        cursor.execute("""
            SELECT g.filename, g.format, g.mime_type, g.created_at, m.content
            FROM generated_files g
            JOIN messages m ON g.message_id = m.id
            ORDER BY g.created_at DESC
        """)
        generated_files = cursor.fetchall()
        
        if generated_files:
            for i, file in enumerate(generated_files, 1):
                print(f"  📄 生成文件 {i}:")
                print(f"     文件名: {file[0]}")
                print(f"     格式: {file[1]}")
                print(f"     类型: {file[2]}")
                print(f"     生成时间: {file[3]}")
                content_preview = file[4][:50] + "..." if len(file[4]) > 50 else file[4]
                print(f"     关联消息: {content_preview}")
        else:
            print("  ⚠️  暂无生成的文件数据")
        
        # 查看文件存储目录
        print("\n📁 文件存储目录:")
        uploads_dir = "uploads"
        generated_dir = "generated"
        
        if os.path.exists(uploads_dir):
            upload_files = os.listdir(uploads_dir)
            print(f"  📁 {uploads_dir}/ ({len(upload_files)} 个文件)")
            for file in upload_files[:5]:  # 只显示前5个
                print(f"     - {file}")
            if len(upload_files) > 5:
                print(f"     ... 还有 {len(upload_files) - 5} 个文件")
        else:
            print(f"  ⚠️  {uploads_dir}/ 目录不存在")
        
        if os.path.exists(generated_dir):
            generated_files = os.listdir(generated_dir)
            print(f"  📁 {generated_dir}/ ({len(generated_files)} 个文件)")
            for file in generated_files[:5]:  # 只显示前5个
                print(f"     - {file}")
            if len(generated_files) > 5:
                print(f"     ... 还有 {len(generated_files) - 5} 个文件")
        else:
            print(f"  ⚠️  {generated_dir}/ 目录不存在")
        
        print("\n" + "=" * 80)
        
    except sqlite3.Error as e:
        print(f"❌ 数据库错误: {e}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
    finally:
        if 'conn' in locals():
            conn.close()

def export_conversation(conversation_id):
    """导出特定对话为JSON文件"""
    db_path = "dialogue_forge.db"
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件 {db_path} 不存在")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取对话信息
        cursor.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
        conversation = cursor.fetchone()
        
        if not conversation:
            print(f"❌ 对话 {conversation_id} 不存在")
            return
        
        # 获取消息
        cursor.execute("""
            SELECT m.*, 
                   GROUP_CONCAT(a.filename) as attachment_files,
                   GROUP_CONCAT(g.filename) as generated_files
            FROM messages m
            LEFT JOIN attachments a ON m.id = a.message_id
            LEFT JOIN generated_files g ON m.id = g.message_id
            WHERE m.conversation_id = ?
            GROUP BY m.id
            ORDER BY m.created_at ASC
        """, (conversation_id,))
        
        messages = cursor.fetchall()
        
        # 构建导出数据
        export_data = {
            "conversation": {
                "id": conversation[0],
                "title": conversation[1],
                "created_at": conversation[2],
                "updated_at": conversation[3],
                "user_id": conversation[4],
                "model": conversation[5]
            },
            "messages": []
        }
        
        for msg in messages:
            message_data = {
                "id": msg[0],
                "conversation_id": msg[1],
                "role": msg[2],
                "content": msg[3],
                "created_at": msg[4],
                "attachments": msg[5].split(',') if msg[5] else [],
                "generated_files": msg[6].split(',') if msg[6] else []
            }
            export_data["messages"].append(message_data)
        
        # 保存到文件
        filename = f"conversation_{conversation_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 对话已导出到: {filename}")
        
    except Exception as e:
        print(f"❌ 导出失败: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "export":
        if len(sys.argv) > 2:
            conversation_id = sys.argv[2]
            export_conversation(conversation_id)
        else:
            print("❌ 请提供对话ID: python view_db.py export <conversation_id>")
    else:
        view_database()
        print("\n💡 提示:")
        print("  - 使用 'python view_db.py export <conversation_id>' 导出特定对话")
        print("  - 访问 http://localhost:8001/docs 查看API文档")
        print("  - 访问 http://localhost:8001/api/stats 查看统计信息")