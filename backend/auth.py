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
import db

load_dotenv()

# JWT配置
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_HOURS = 24

# 密码安全配置
BCRYPT_ROUNDS = 12

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

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """获取当前用户（可选，不抛出异常）"""
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

# 认证业务逻辑
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
    # 根据登录类型获取用户
    if login_data.login_type == "email":
        user = await db.get_user_by_email(login_data.identifier)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="邮箱或密码错误"
            )
    elif login_data.login_type == "phone":
        user = await db.get_user_by_phone(login_data.identifier)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="手机号或密码错误"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="不支持的登录类型"
        )
    
    # 验证密码
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=400,
            detail="邮箱或密码错误" if login_data.login_type == "email" else "手机号或密码错误"
        )
    
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
