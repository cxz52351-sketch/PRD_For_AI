import aiomysql
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

# 全局连接池
POOL = None

async def get_pool():
    """获取MySQL连接池"""
    global POOL
    if POOL and not POOL.closed:
        return POOL
    
    POOL = await aiomysql.create_pool(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        db=os.getenv("MYSQL_DATABASE"),
        autocommit=True,
        minsize=1,
        maxsize=10,
        charset="utf8mb4"
    )
    return POOL

async def init_db():
    """初始化数据库，创建必要的表"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            print("开始初始化MySQL数据库...")
            
            # 创建users表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(32) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 创建conversations表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                user_id VARCHAR(36),
                model VARCHAR(255) NOT NULL DEFAULT 'gpt-3.5-turbo',
                CONSTRAINT fk_conv_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 创建messages表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id VARCHAR(36) PRIMARY KEY,
                conversation_id VARCHAR(36) NOT NULL,
                role VARCHAR(32) NOT NULL,
                content MEDIUMTEXT NOT NULL,
                files MEDIUMTEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                copy_count INT DEFAULT 0,
                last_copied_at TIMESTAMP NULL,
                CONSTRAINT fk_msg_conv FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 创建attachments表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS attachments (
                id VARCHAR(36) PRIMARY KEY,
                message_id VARCHAR(36) NOT NULL,
                file_url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_att_msg FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 创建generated_files表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS generated_files (
                id VARCHAR(36) PRIMARY KEY,
                message_id VARCHAR(36) NOT NULL,
                file_url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_genfile_msg FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 创建email_verifications表
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS email_verifications (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(10) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            print("MySQL数据库初始化完成")

# === 用户相关操作 ===
async def create_user(username: str, email: str, phone: str, password_hash: str, avatar: str = None) -> str:
    """创建新用户"""
    user_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO users (id, username, email, phone, password_hash, avatar) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, username, email, phone, password_hash, avatar)
            )
    return user_id

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """根据邮箱获取用户"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            row = await cur.fetchone()
            return dict(row) if row else None

async def get_user_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    """根据手机号获取用户"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE phone = %s", (phone,))
            row = await cur.fetchone()
            return dict(row) if row else None

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """根据ID获取用户"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            row = await cur.fetchone()
            return dict(row) if row else None

async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """根据用户名获取用户（用于注册时唯一性校验）"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE username = %s", (username,))
            row = await cur.fetchone()
            return dict(row) if row else None

async def get_users(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """获取用户列表"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
            rows = await cur.fetchall()
            return [dict(row) for row in rows]

async def update_user_last_login(user_id: str):
    """更新用户最后登录时间"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user_id,))

# === 对话相关操作 ===
async def create_conversation(title: str, model: str, user_id: Optional[str] = None) -> str:
    """创建新对话"""
    conversation_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # 如果提供了user_id，验证用户是否存在
            final_user_id = None
            if user_id:
                await cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                user_exists = await cur.fetchone()
                if user_exists:
                    final_user_id = user_id
                else:
                    print(f"警告: 用户ID {user_id} 不存在，创建匿名对话")
            
            await cur.execute(
                "INSERT INTO conversations (id, title, user_id, model) VALUES (%s, %s, %s, %s)",
                (conversation_id, title, final_user_id, model)
            )
    return conversation_id

async def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """获取对话信息"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM conversations WHERE id = %s", (conversation_id,))
            row = await cur.fetchone()
            return dict(row) if row else None

async def get_conversations(user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """获取对话列表"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if user_id:
                await cur.execute("SELECT * FROM conversations WHERE user_id = %s ORDER BY updated_at DESC LIMIT %s OFFSET %s",
                                  (user_id, limit, offset))
            else:
                await cur.execute("SELECT * FROM conversations ORDER BY updated_at DESC LIMIT %s OFFSET %s",
                                  (limit, offset))
            rows = await cur.fetchall()
            return [dict(row) for row in rows]

async def update_conversation_title(conversation_id: str, title: str) -> bool:
    """更新对话标题"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE conversations SET title = %s, updated_at = NOW() WHERE id = %s", (title, conversation_id))
            return cur.rowcount > 0

async def delete_conversation(conversation_id: str) -> bool:
    """删除对话"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
            return cur.rowcount > 0

# === 消息相关操作 ===
async def add_message(conversation_id: str, role: str, content: str, files: Optional[str] = None) -> str:
    """添加消息"""
    message_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO messages (id, conversation_id, role, content, files) VALUES (%s, %s, %s, %s, %s)",
                (message_id, conversation_id, role, content, files)
            )
            # 更新对话的最后更新时间
            await cur.execute("UPDATE conversations SET updated_at = NOW() WHERE id = %s", (conversation_id,))
    return message_id

async def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
    """获取对话的所有消息"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC", (conversation_id,))
            rows = await cur.fetchall()
            return [dict(row) for row in rows]

# === 复制统计相关操作 ===
async def record_message_copy(message_id: str) -> bool:
    """记录消息复制事件"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE messages SET copy_count = COALESCE(copy_count, 0) + 1, last_copied_at = NOW() WHERE id = %s",
                    (message_id,)
                )
                return cur.rowcount > 0
    except Exception as e:
        print(f"记录复制事件失败: {e}")
        return False

async def get_message_copy_stats(message_id: str) -> Dict[str, Any]:
    """获取消息复制统计信息"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT copy_count, last_copied_at FROM messages WHERE id = %s", (message_id,))
                row = await cur.fetchone()
                if row:
                    return dict(row)
                return {"copy_count": 0, "last_copied_at": None}
    except Exception as e:
        print(f"获取复制统计失败: {e}")
        return {"copy_count": 0, "last_copied_at": None}

# === 附件相关操作 ===
async def add_attachment(message_id: str, file_url: str) -> str:
    """添加附件"""
    attachment_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO attachments (id, message_id, file_url) VALUES (%s, %s, %s)",
                (attachment_id, message_id, file_url)
            )
    return attachment_id

async def add_generated_file(message_id: str, file_url: str) -> str:
    """添加生成的文件"""
    file_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO generated_files (id, message_id, file_url) VALUES (%s, %s, %s)",
                (file_id, message_id, file_url)
            )
    return file_id

# === 邮箱验证相关操作 ===
async def store_verification_code(email: str, code: str, expires_at: datetime) -> str:
    """存储邮箱验证码"""
    verification_id = str(uuid.uuid4())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO email_verifications (id, email, code, expires_at) VALUES (%s, %s, %s, %s)",
                (verification_id, email, code, expires_at)
            )
    return verification_id

async def verify_code(email: str, code: str) -> bool:
    """验证邮箱验证码"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id FROM email_verifications WHERE email = %s AND code = %s AND expires_at > NOW() AND is_used = FALSE",
                (email, code)
            )
            row = await cur.fetchone()
            if row:
                # 标记为已使用
                await cur.execute("UPDATE email_verifications SET is_used = TRUE WHERE id = %s", (row[0],))
                return True
            return False

async def mark_email_verified(verification_id: str) -> bool:
    """标记邮箱验证记录为已使用（用于邮箱验证完成）"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE email_verifications SET is_used = TRUE WHERE id = %s",
                (verification_id,)
            )
            return cur.rowcount > 0

async def cleanup_expired_verifications() -> int:
    """清理过期的邮箱验证记录"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM email_verifications WHERE expires_at < NOW()")
            return cur.rowcount

# === 统计相关操作 ===
async def get_stats() -> Dict[str, Any]:
    """获取系统统计信息"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # 用户总数
            await cur.execute("SELECT COUNT(*) FROM users")
            user_count = (await cur.fetchone())[0]
            
            # 对话总数
            await cur.execute("SELECT COUNT(*) FROM conversations")
            conversation_count = (await cur.fetchone())[0]
            
            # 消息总数
            await cur.execute("SELECT COUNT(*) FROM messages")
            message_count = (await cur.fetchone())[0]
            
            return {
                "users": user_count,
                "conversations": conversation_count,
                "messages": message_count
            }