import aiosqlite
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), "dialogue_forge.db")

# 初始化数据库
async def init_db():
    """初始化数据库，创建必要的表"""
    async with aiosqlite.connect(DB_PATH) as db:
        # 启用外键约束
        await db.execute("PRAGMA foreign_keys = ON")
        
        # 创建users表
        await db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            avatar TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP
        )
        """)
        
        # 创建conversations表
        await db.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            user_id TEXT,
            model TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
        """)
        
        # 创建messages表
        await db.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
        """)
        
        # 创建attachments表
        await db.execute("""
        CREATE TABLE IF NOT EXISTS attachments (
            id TEXT PRIMARY KEY,
            message_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
        )
        """)
        
        # 创建generated_files表
        await db.execute("""
        CREATE TABLE IF NOT EXISTS generated_files (
            id TEXT PRIMARY KEY,
            message_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            format TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
        )
        """)
        
        await db.commit()

# 对话操作
async def create_conversation(title: str, model: str, user_id: Optional[str] = None) -> str:
    """创建新对话，返回对话ID"""
    conversation_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO conversations (id, title, created_at, updated_at, user_id, model) VALUES (?, ?, ?, ?, ?, ?)",
            (conversation_id, title, now, now, user_id, model)
        )
        await db.commit()
    
    return conversation_id

async def update_conversation_title(conversation_id: str, title: str) -> bool:
    """更新对话标题"""
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, conversation_id)
        )
        await db.commit()
        return cursor.rowcount > 0

async def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """获取对话信息"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM conversations WHERE id = ?", 
            (conversation_id,)
        )
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)

async def get_conversations(user_id: Optional[str] = None, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
    """获取对话列表"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        if user_id:
            cursor = await db.execute(
                "SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?",
                (user_id, limit, offset)
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?",
                (limit, offset)
            )
        
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def delete_conversation(conversation_id: str) -> bool:
    """删除对话"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM conversations WHERE id = ?",
            (conversation_id,)
        )
        await db.commit()
        return cursor.rowcount > 0

# 消息操作
async def add_message(conversation_id: str, role: str, content: str) -> str:
    """添加消息，返回消息ID"""
    message_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        # 添加消息
        await db.execute(
            "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
            (message_id, conversation_id, role, content, now)
        )
        
        # 更新对话的更新时间
        await db.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?",
            (now, conversation_id)
        )
        
        await db.commit()
    
    return message_id

async def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
    """获取对话的所有消息"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # 获取消息
        cursor = await db.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        
        messages = []
        rows = await cursor.fetchall()
        for row in rows:
            message = dict(row)
            
            # 获取消息的附件
            attachments_cursor = await db.execute(
                "SELECT * FROM attachments WHERE message_id = ?",
                (message["id"],)
            )
            attachments = [dict(row) for row in await attachments_cursor.fetchall()]
            if attachments:
                message["attachments"] = attachments
            
            # 获取消息的生成文件
            files_cursor = await db.execute(
                "SELECT * FROM generated_files WHERE message_id = ?",
                (message["id"],)
            )
            files = [dict(row) for row in await files_cursor.fetchall()]
            if files:
                message["generated_files"] = files
            
            messages.append(message)
        
        return messages

# 附件操作
async def add_attachment(message_id: str, filename: str, file_path: str, mime_type: str) -> str:
    """添加附件，返回附件ID"""
    attachment_id = str(uuid.uuid4())
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO attachments (id, message_id, filename, file_path, mime_type) VALUES (?, ?, ?, ?, ?)",
            (attachment_id, message_id, filename, file_path, mime_type)
        )
        await db.commit()
    
    return attachment_id

# 生成文件操作
async def add_generated_file(message_id: str, filename: str, file_path: str, mime_type: str, format: str) -> str:
    """添加生成的文件，返回文件ID"""
    file_id = str(uuid.uuid4())
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO generated_files (id, message_id, filename, file_path, mime_type, format) VALUES (?, ?, ?, ?, ?, ?)",
            (file_id, message_id, filename, file_path, mime_type, format)
        )
        await db.commit()
    
    return file_id

# 统计信息
async def get_stats() -> Dict[str, Any]:
    """获取统计信息"""
    async with aiosqlite.connect(DB_PATH) as db:
        # 对话总数
        cursor = await db.execute("SELECT COUNT(*) FROM conversations")
        conversations_count = (await cursor.fetchone())[0]
        
        # 消息总数
        cursor = await db.execute("SELECT COUNT(*) FROM messages")
        messages_count = (await cursor.fetchone())[0]
        
        # 附件总数
        cursor = await db.execute("SELECT COUNT(*) FROM attachments")
        attachments_count = (await cursor.fetchone())[0]
        
        # 生成文件总数
        cursor = await db.execute("SELECT COUNT(*) FROM generated_files")
        generated_files_count = (await cursor.fetchone())[0]
        
        return {
            "conversations": conversations_count,
            "messages": messages_count,
            "attachments": attachments_count,
            "generated_files": generated_files_count
        }

# 用户操作
async def create_user(username: str, password_hash: str, email: Optional[str] = None, 
                     phone: Optional[str] = None, avatar: Optional[str] = None) -> str:
    """创建用户，返回用户ID"""
    user_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO users (id, username, email, phone, password_hash, avatar, 
               created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, username, email, phone, password_hash, avatar, now, now)
        )
        await db.commit()
    
    return user_id

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """根据ID获取用户"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE id = ?", 
            (user_id,)
        )
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)

async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """根据用户名获取用户"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE username = ?", 
            (username,)
        )
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """根据邮箱获取用户"""
    if not email:
        return None
        
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE email = ?", 
            (email,)
        )
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)

async def get_user_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    """根据手机号获取用户"""
    if not phone:
        return None
        
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE phone = ?", 
            (phone,)
        )
        row = await cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)

async def update_user_last_login(user_id: str) -> bool:
    """更新用户最后登录时间"""
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?",
            (now, now, user_id)
        )
        await db.commit()
        return cursor.rowcount > 0

async def update_user_info(user_id: str, **kwargs) -> bool:
    """更新用户信息"""
    if not kwargs:
        return False
    
    # 过滤掉None值和不允许更新的字段
    allowed_fields = {'username', 'email', 'phone', 'avatar'}
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}
    
    if not updates:
        return False
    
    # 添加更新时间
    updates['updated_at'] = datetime.now().isoformat()
    
    # 构建SQL语句
    set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [user_id]
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            f"UPDATE users SET {set_clause} WHERE id = ?",
            values
        )
        await db.commit()
        return cursor.rowcount > 0

async def delete_user(user_id: str) -> bool:
    """删除用户"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM users WHERE id = ?",
            (user_id,)
        )
        await db.commit()
        return cursor.rowcount > 0

async def get_users(limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
    """获取用户列表"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, username, email, phone, avatar, created_at, updated_at, last_login_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset)
        )
        
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]