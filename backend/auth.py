"""
用户认证模块
提供用户注册、登录、Token验证等功能
"""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Union
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uuid
import secrets
import db_mysql as db

load_dotenv("1.env")

# JWT配置
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_HOURS = 24

# 密码安全配置
BCRYPT_ROUNDS = 12

# 邮箱验证配置
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
VERIFICATION_URL_BASE = os.getenv("VERIFICATION_URL_BASE", "http://localhost:3000")

# HTTP Bearer Token安全方案
security = HTTPBearer(auto_error=False)

# 用户数据模型
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    identifier: str  # 可以是邮箱或手机号
    password: str
    login_type: str  # "email" 或 "phone"

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class VerifyEmailRequest(BaseModel):
    token: str

class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime
    
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None

# 工具函数
def hash_password(password: str) -> str:
    """加密密码"""
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """验证JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id)
    except jwt.PyJWTError:
        return None

def generate_avatar_url(identifier: str) -> str:
    """生成头像URL"""
    return f"https://api.dicebear.com/7.x/avataaars/svg?seed={identifier}"

def generate_verification_token() -> str:
    """生成邮箱验证token"""
    return secrets.token_urlsafe(32)

async def send_verification_email(email: str, token: str) -> bool:
    """发送邮箱验证邮件"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"邮箱服务未配置，模拟发送验证邮件到: {email}")
        print(f"验证链接: {VERIFICATION_URL_BASE}/verify-email?token={token}")
        print("=" * 60)
        # 在开发环境下，我们返回True来模拟邮件发送成功
        return True
    
    try:
        # 创建邮件内容
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "PRD For AI - 邮箱验证"
        
        # 验证链接
        verification_url = f"{VERIFICATION_URL_BASE}/verify-email?token={token}"
        
        # HTML邮件内容
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">PRD For AI</h1>
                <p style="color: white; margin: 10px 0 0 0;">邮箱验证</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">验证您的邮箱地址</h2>
                <p style="color: #666; line-height: 1.6;">
                    感谢您注册 PRD For AI！为了确保您的账户安全，请点击下面的链接验证您的邮箱地址：
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        验证邮箱
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    如果按钮无法点击，请复制以下链接到浏览器中打开：<br>
                    <a href="{verification_url}" style="color: #667eea;">{verification_url}</a>
                </p>
                
                <p style="color: #666; font-size: 14px;">
                    此验证链接将在24小时后过期。如果您没有注册 PRD For AI，请忽略此邮件。
                </p>
            </div>
            
            <div style="padding: 20px; text-align: center; background: #e9e9e9; color: #666; font-size: 12px;">
                <p>© 2024 PRD For AI. 保留所有权利。</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html', 'utf-8'))
        
        # 发送邮件
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(SMTP_USERNAME, email, text)
        
        print(f"验证邮件已成功发送到: {email}")
        return True
        
    except Exception as e:
        print(f"发送验证邮件失败: {str(e)}")
        print(f"验证链接（用于测试）: {VERIFICATION_URL_BASE}/verify-email?token={token}")
        print("=" * 60)
        # 即使邮件发送失败，我们在开发环境下也返回True，并打印验证链接供测试
        return True

# 依赖函数
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """获取当前认证用户"""
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="未提供认证Token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="无效的认证Token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 从数据库获取用户信息
    user = await db.get_user_by_id(token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[dict]:
    """获取当前用户（可选，不抛出异常）"""
    if not credentials:
        return None
    
    try:
        # 验证Token
        token_data = verify_token(credentials.credentials)
        if not token_data:
            return None
        
        # 从数据库获取用户信息
        user = await db.get_user_by_id(token_data.user_id)
        return user
    except Exception:
        return None

# 认证业务逻辑
async def send_verification_code(email_data: EmailVerificationRequest) -> dict:
    """发送邮箱验证码"""
    # 检查邮箱是否已被注册
    existing_user = await db.get_user_by_email(email_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="邮箱已被注册"
        )
    
    # 生成验证token
    token = generate_verification_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)  # 24小时后过期
    
    # 保存验证记录到数据库
    verification_id = await db.create_email_verification(
        email=email_data.email,
        token=token,
        expires_at=expires_at
    )
    
    # 发送验证邮件
    success = await send_verification_email(email_data.email, token)
    
    if not success:
        # 删除刚创建的验证记录
        await db.delete_email_verification(verification_id)
        raise HTTPException(
            status_code=500,
            detail="邮件发送失败，请稍后重试"
        )
    
    return {"message": "验证邮件已发送，请检查您的邮箱"}

async def verify_email(verify_data: VerifyEmailRequest) -> dict:
    """验证邮箱"""
    # 查找验证记录
    verification = await db.get_email_verification_by_token(verify_data.token)
    
    if not verification:
        raise HTTPException(
            status_code=400,
            detail="无效的验证链接"
        )
    
    # 检查是否过期
    if datetime.utcnow() > verification["expires_at"]:
        await db.delete_email_verification(verification["id"])
        raise HTTPException(
            status_code=400,
            detail="验证链接已过期，请重新发送"
        )
    
    # 检查是否已被验证
    if verification["is_verified"]:
        raise HTTPException(
            status_code=400,
            detail="邮箱已被验证"
        )
    
    # 标记为已验证
    await db.mark_email_verified(verification["id"])
    
    return {
        "message": "邮箱验证成功",
        "email": verification["email"]
    }

async def register_user(user_data: UserCreate) -> Token:
    """用户注册"""
    # 检查用户名是否已存在
    existing_user = await db.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    if user_data.email:
        existing_email = await db.get_user_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="邮箱已被注册"
            )
    
    # 检查手机号是否已存在
    if user_data.phone:
        existing_phone = await db.get_user_by_phone(user_data.phone)
        if existing_phone:
            raise HTTPException(
                status_code=400,
                detail="手机号已被注册"
            )
    
    # 验证密码长度
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="密码长度不能少于6位"
        )
    
    # 加密密码
    hashed_password = hash_password(user_data.password)
    
    # 生成头像
    avatar_seed = user_data.email or user_data.phone or user_data.username
    avatar_url = generate_avatar_url(avatar_seed)
    
    # 创建用户
    user_id = await db.create_user(
        username=user_data.username,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        avatar=avatar_url
    )
    
    # 获取创建的用户信息
    user = await db.get_user_by_id(user_id)
    
    # 创建访问令牌
    access_token_expires = timedelta(hours=JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": str(user_id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600,  # 转换为秒
        user=UserResponse(
            id=str(user["id"]),
            username=user["username"],
            email=user["email"],
            phone=user["phone"],
            avatar=user["avatar"],
            created_at=user["created_at"]
        )
    )

async def login_user(login_data: UserLogin) -> Token:
    """用户登录"""
    print(f"🔍 登录尝试 - 类型: {login_data.login_type}, 标识符: {login_data.identifier}")
    
    # 根据登录类型获取用户
    if login_data.login_type == "email":
        print(f"🔍 通过邮箱查找用户: {login_data.identifier}")
        user = await db.get_user_by_email(login_data.identifier)
        if not user:
            print(f"❌ 邮箱未找到用户: {login_data.identifier}")
            raise HTTPException(
                status_code=400,
                detail="邮箱或密码错误"
            )
        print(f"✅ 找到用户: ID={user['id']}, 用户名={user['username']}")
    elif login_data.login_type == "phone":
        print(f"🔍 通过手机号查找用户: {login_data.identifier}")
        user = await db.get_user_by_phone(login_data.identifier)
        if not user:
            print(f"❌ 手机号未找到用户: {login_data.identifier}")
            raise HTTPException(
                status_code=400,
                detail="手机号或密码错误"
            )
        print(f"✅ 找到用户: ID={user['id']}, 用户名={user['username']}")
    else:
        print(f"❌ 不支持的登录类型: {login_data.login_type}")
        raise HTTPException(
            status_code=400,
            detail="不支持的登录类型"
        )
    
    # 验证密码
    print(f"🔍 验证密码...")
    print(f"🔍 输入密码: {login_data.password}")
    print(f"🔍 数据库密码哈希: {user['password_hash'][:50]}...")
    
    password_valid = verify_password(login_data.password, user["password_hash"])
    print(f"🔍 密码验证结果: {password_valid}")
    
    if not password_valid:
        print(f"❌ 密码验证失败")
        raise HTTPException(
            status_code=400,
            detail="邮箱或密码错误" if login_data.login_type == "email" else "手机号或密码错误"
        )
    
    print(f"✅ 登录成功: {user['username']} ({user['email']})")
    
    # 更新最后登录时间
    await db.update_user_last_login(user["id"])
    
    # 创建访问令牌
    access_token_expires = timedelta(hours=JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer", 
        expires_in=JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600,  # 转换为秒
        user=UserResponse(
            id=str(user["id"]),
            username=user["username"],
            email=user["email"],
            phone=user["phone"],
            avatar=user["avatar"],
            created_at=user["created_at"]
        )
    )
    
async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """验证管理员权限 - 只有特定邮箱的用户才能访问管理功能"""
    ADMIN_EMAIL = "490429443@qq.com"
    
    if not current_user.get("email") or current_user["email"] != ADMIN_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="权限不足：只有管理员可以访问此功能"
        )
    
    return current_user
