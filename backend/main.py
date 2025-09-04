import os
from dotenv import load_dotenv
load_dotenv("1.env")

# 条件导入数据库模块
if os.getenv("USE_MYSQL", "false").lower() == "true":
    import db_mysql as db
    print("使用MySQL数据库")
else:
    import db
    print("使用SQLite数据库")

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
import httpx
import json
import os
from dotenv import load_dotenv
import asyncio
import aiofiles
import uuid
from datetime import datetime
from docx import Document
from docx.shared import Inches
import markdown
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re
import base64
from auth import (
    UserCreate, UserLogin, Token, UserResponse, EmailVerificationRequest, VerifyEmailRequest,
    register_user, login_user, get_current_user, get_current_user_optional,
    send_verification_code, verify_email, get_admin_user
)

# 加载环境变量
load_dotenv("1.env")

app = FastAPI(title="Indus AI Dialogue Forge API", version="1.0.0")

# 应用启动时初始化数据库
@app.on_event("startup")
async def startup_event():
    await db.init_db()
    print("数据库初始化完成")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    # 开发环境放宽跨域，前端端口可能变化（8081/8082/8083/8084...）
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class Message(BaseModel):
    role: str
    content: str

class FileInfo(BaseModel):
    type: str  # 'image' 或 'file'
    transfer_method: str  # 'local_file' 等
    url: Optional[str] = None  # base64数据或URL
    upload_file_id: Optional[str] = None  # 上传文件ID
    name: Optional[str] = None  # 文件名
    mime_type: Optional[str] = None  # MIME类型

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 4000
    stream: bool = True
    output_format: str = "text"  # text, pdf, docx, markdown
    conversation_id: Optional[str] = None  # 本地数据库对话ID
    dify_conversation_id: Optional[str] = None  # Dify 会话ID，用于与 Dify 持续对话
    files: Optional[List[FileInfo]] = None  # 文件列表

class ChatResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

# Dify API 配置（可通过环境变量覆盖），默认指向教研环境网关
# 如需切换，请在运行环境中设置 DIFY_API_BASE 与 DIFY_API_KEY
DIFY_API_BASE = os.getenv("DIFY_API_BASE", "http://teach.excelmaster.ai/v1")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "app-5zA5RoIpzA3isrshEQnWbvmq")
# 优先调用工作流接口（/workflows/run）。如需改为应用聊天接口（/chat-messages），将该值设为 "chat"
DIFY_API_CHANNEL = os.getenv("DIFY_API_CHANNEL", "workflow")  # workflow | chat

async def upload_file_to_dify(file_data: bytes, filename: str, mime_type: str) -> str:
    """上传文件到 Dify API 并返回 upload_file_id"""
    try:
        # 构建 multipart/form-data 请求
        from io import BytesIO
        
        # 创建文件对象
        file_obj = BytesIO(file_data)
        
        # 使用 httpx 发送 multipart 请求，启用重定向跟随
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            files = {
                'file': (filename, file_obj, mime_type)
            }
            data = {
                'user': 'abc-123'
            }
            headers = {
                "Authorization": f"Bearer {DIFY_API_KEY}"
            }
            
            response = await client.post(
                f"{DIFY_API_BASE}/files/upload",
                files=files,
                data=data,
                headers=headers
            )
            
            print(f"Dify 文件上传响应: {response.status_code}")
            if response.status_code not in [200, 201]:  # 201 是创建成功的状态码
                print(f"Dify 文件上传失败: {response.status_code} - {response.text}")
                return None
            
            result = response.json()
            print(f"Dify 文件上传结果: {result}")
            return result.get('id')  # 返回 upload_file_id
            
    except Exception as e:
        print(f"上传文件到 Dify 失败: {str(e)}")
        return None

if not DIFY_API_KEY:
    print("警告: 未设置DIFY_API_KEY环境变量")

# 文件存储目录
UPLOAD_DIR = "uploads"
GENERATED_DIR = "generated"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

# ================================
# 用户认证API
# ================================

@app.post("/auth/send-verification", tags=["Authentication"])
async def send_verification_endpoint(email_data: EmailVerificationRequest):
    """发送邮箱验证码"""
    return await send_verification_code(email_data)

@app.post("/auth/verify-email", tags=["Authentication"])
async def verify_email_endpoint(verify_data: VerifyEmailRequest):
    """验证邮箱"""
    return await verify_email(verify_data)

@app.post("/auth/register", response_model=Token, tags=["Authentication"])
async def register_endpoint(user_data: UserCreate):
    """用户注册"""
    return await register_user(user_data)

@app.post("/auth/login", response_model=Token, tags=["Authentication"])
async def login_endpoint(login_data: UserLogin):
    """用户登录"""
    return await login_user(login_data)

@app.get("/auth/me", response_model=UserResponse, tags=["Authentication"])
async def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse(
        id=str(current_user["id"]),
        username=current_user["username"],
        email=current_user["email"],
        phone=current_user["phone"],
        avatar=current_user["avatar"],
        created_at=current_user["created_at"]
    )

@app.get("/auth/verify", tags=["Authentication"])
async def verify_token_endpoint(current_user: dict = Depends(get_current_user)):
    """验证Token有效性"""
    return {"valid": True, "user_id": current_user["id"]}

# 文件生成函数
async def generate_markdown_file(content: str, filename: str) -> str:
    """生成Markdown文件"""
    file_path = os.path.join(GENERATED_DIR, filename)
    async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
        await f.write(content)
    return file_path

async def generate_docx_file(content: str, filename: str) -> str:
    """生成DOCX文件"""
    doc = Document()
    
    # 添加标题
    title = doc.add_heading('AI生成文档', 0)
    title.alignment = 1  # 居中对齐
    
    # 添加时间戳
    doc.add_paragraph(f'生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    doc.add_paragraph()  # 空行
    
    # 处理内容，支持基本的Markdown格式
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            doc.add_paragraph()
            continue
            
        # 标题处理
        if line.startswith('# '):
            doc.add_heading(line[2:], level=1)
        elif line.startswith('## '):
            doc.add_heading(line[3:], level=2)
        elif line.startswith('### '):
            doc.add_heading(line[4:], level=3)
        elif line.startswith('**') and line.endswith('**'):
            # 粗体
            p = doc.add_paragraph()
            run = p.add_run(line[2:-2])
            run.bold = True
        elif line.startswith('- ') or line.startswith('* '):
            # 列表项
            doc.add_paragraph(line[2:], style='List Bullet')
        elif line.startswith('```'):
            # 代码块开始/结束，忽略
            continue
        else:
            # 普通段落
            doc.add_paragraph(line)
    
    file_path = os.path.join(GENERATED_DIR, filename)
    doc.save(file_path)
    return file_path

async def generate_pdf_file(content: str, filename: str) -> str:
    """生成PDF文件"""
    file_path = os.path.join(GENERATED_DIR, filename)
    
    # 创建PDF文档
    doc = SimpleDocTemplate(file_path, pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=18)
    
    # 获取样式
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    normal_style = styles['Normal']
    heading_style = styles['Heading1']
    
    # 创建内容列表
    story = []
    
    # 添加标题
    story.append(Paragraph("AI生成文档", title_style))
    story.append(Spacer(1, 12))
    
    # 添加时间戳
    story.append(Paragraph(f'生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', normal_style))
    story.append(Spacer(1, 12))
    
    # 处理内容
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 6))
            continue
            
        # 处理标题
        if line.startswith('# '):
            story.append(Paragraph(line[2:], heading_style))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:], heading_style))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], heading_style))
        else:
            # 清理特殊字符，避免ReportLab解析错误
            clean_line = re.sub(r'[<>&]', '', line)
            story.append(Paragraph(clean_line, normal_style))
        
        story.append(Spacer(1, 6))
    
    # 构建PDF
    doc.build(story)
    return file_path

async def generate_file(content: str, output_format: str) -> Optional[Dict[str, str]]:
    """根据格式生成文件"""
    if output_format == "text":
        return None
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_id = str(uuid.uuid4())[:8]
    
    try:
        if output_format == "markdown":
            filename = f"ai_response_{timestamp}_{file_id}.md"
            file_path = await generate_markdown_file(content, filename)
            return {
                "filename": filename,
                "url": f"/api/files/{filename}",
                "mime_type": "text/markdown"
            }
        elif output_format == "docx":
            filename = f"ai_response_{timestamp}_{file_id}.docx"
            file_path = await generate_docx_file(content, filename)
            return {
                "filename": filename,
                "url": f"/api/files/{filename}",
                "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }
        elif output_format == "pdf":
            filename = f"ai_response_{timestamp}_{file_id}.pdf"
            file_path = await generate_pdf_file(content, filename)
            return {
                "filename": filename,
                "url": f"/api/files/{filename}",
                "mime_type": "application/pdf"
            }
    except Exception as e:
        print(f"文件生成错误: {str(e)}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        return None
    
    return None

@app.get("/")
async def root():
    return {"message": "Indus AI Dialogue Forge API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/db-status")
async def check_database_status():
    """检查数据库状态"""
    try:
        stats = await db.get_stats()
        return {
            "status": "ok",
            "database_type": "MySQL" if os.getenv("USE_MYSQL", "false").lower() == "true" else "SQLite",
            "stats": stats,
            "mysql_config": {
                "host": os.getenv("MYSQL_HOST"),
                "database": os.getenv("MYSQL_DATABASE"),
                "user": os.getenv("MYSQL_USER")
            } if os.getenv("USE_MYSQL", "false").lower() == "true" else None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "database_type": "MySQL" if os.getenv("USE_MYSQL", "false").lower() == "true" else "SQLite",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/chat")
async def chat_with_dify(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    通过 Dify 工作流进行对话（兼容现有前端协议）。
    - 流式：将 Dify SSE 事件转换为 OpenAI/DeepSeek 风格的 delta 流
    - 阻塞：将 Dify 的 answer 映射到 choices[0].message.content
    """
    if not DIFY_API_KEY:
        raise HTTPException(status_code=500, detail="Dify API密钥未配置")
    
    try:
        print(f"开始处理聊天请求，Dify API Key: {DIFY_API_KEY[:8]}...")
        
        # 从请求中提取用户消息（取最后一个，即当前轮的输入）
        user_messages = [msg for msg in request.messages if msg.role == "user"]
        if not user_messages:
            raise HTTPException(status_code=400, detail="请求中必须包含用户消息")
        
        user_message = user_messages[-1]  # 取最后一个用户消息
        print(f"提取到的用户消息: {user_message.content[:100]}...")
        print(f"总共有 {len(user_messages)} 条用户消息，使用最后一条")
        
        # 创建或获取对话ID
        conversation_id = request.conversation_id
        
        if not conversation_id:
            # 创建新对话 - 必须有登录用户
            title = user_message.content[:30] + "..." if len(user_message.content) > 30 else user_message.content
            user_id_for_conversation = current_user["id"]
            print(f"为用户 {user_id_for_conversation} 创建新对话")

            try:
                conversation_id = await db.create_conversation(
                    title=title,
                    model=request.model,
                    user_id=user_id_for_conversation
                )
                print(f"创建新对话成功: {conversation_id}")
            except Exception as e:
                print(f"创建对话失败: {e}")
                raise HTTPException(status_code=500, detail=f"创建对话失败: {str(e)}")
        else:
            # 验证对话是否存在
            conversation = await db.get_conversation(conversation_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="指定的对话不存在")
            print(f"使用现有对话: {conversation_id}")
        
        # 存储用户消息
        user_message_id = await db.add_message(
            conversation_id=conversation_id,
            role="user",
            content=user_message.content
        )
        print(f"添加用户消息: {user_message_id}")
        
        # Dify 请求数据
        user_query = user_message.content
        # 工作流通常使用 /workflows/run，输入以 inputs 传递；
        # 为了最大兼容，inputs 同时包含 query 与 text 两个键。
        dify_payload = {
            "inputs": {"query": user_query, "text": user_query},
            "query": user_query,  # 若对接到 chat-messages 也可工作
            "response_mode": "streaming" if request.stream else "blocking",
            "conversation_id": (request.dify_conversation_id or ""),
            "user": "abc-123",
        }

        # 处理文件（图片）- 先尝试上传到 Dify，然后使用不同方式传递
        dify_files = []
        has_images = False
        
        if request.files:
            for file_info in request.files:
                if file_info.type == 'image' and file_info.url:
                    has_images = True
                    # 解码 base64 图片数据
                    try:
                        # 解析 data:image/png;base64,xxx 格式
                        if file_info.url.startswith('data:'):
                            header, encoded = file_info.url.split(',', 1)
                            file_data = base64.b64decode(encoded)
                            
                            # 尝试上传到 Dify 获取 upload_file_id
                            upload_file_id = await upload_file_to_dify(
                                file_data, 
                                file_info.name or 'image.png', 
                                file_info.mime_type or 'image/png'
                            )
                            
                            if upload_file_id:
                                # 成功上传，尝试多种传递方式
                                print(f"✅ 图片上传成功，upload_file_id: {upload_file_id}")
                                
                                # 方式1: files 数组
                                dify_files.append({
                                    "type": "image",
                                    "transfer_method": "local_file", 
                                    "upload_file_id": upload_file_id
                                })
                                
                                # 方式2: inputs 中的 input_img 必须是文件列表格式
                                dify_payload["inputs"]["input_img"] = [{
                                    "type": "image",
                                    "transfer_method": "local_file",
                                    "upload_file_id": upload_file_id
                                }]
                                
                            else:
                                # 上传失败，尝试直接在 inputs 中传递 base64
                                print("⚠️ 图片上传失败，尝试直接传递 base64 数据")
                                dify_payload["inputs"]["input_img"] = file_info.url
                        else:
                            print(f"❌ 不支持的图片格式: {file_info.url[:50]}...")
                    except Exception as e:
                        print(f"❌ 处理图片数据失败: {str(e)}")
                        
                elif file_info.type == 'file' and file_info.upload_file_id:
                    # 其他文件类型
                    dify_files.append({
                        "type": "file",
                        "transfer_method": "local_file",
                        "upload_file_id": file_info.upload_file_id
                    })
            
            if dify_files:
                dify_payload["files"] = dify_files
                print(f"📎 添加文件到 files 数组: {len(dify_files)} 个文件")
            
            if "input_img" in dify_payload["inputs"]:
                print(f"📷 添加图片到 inputs.input_img: {str(dify_payload['inputs']['input_img'])[:50]}...")
            
            if has_images and not dify_files and "input_img" not in dify_payload["inputs"]:
                print("⚠️ 图片处理失败，无法传递给 Dify")

        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        if request.stream:
            # 流式响应（SSE）
            print("处理流式响应请求（Dify）...")
            
            async def generate():
                full_content = ""  # 收集完整内容用于文件生成和数据库存储
                ai_message_id = None
                dify_conversation_id = conversation_id
                
                try:
                    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
                        # 根据官方文档：流式端点为 /chat-messages
                        async with client.stream(
                            "POST",
                            f"{DIFY_API_BASE}/chat-messages",
                            json=dify_payload,
                            headers={**headers, "Accept": "text/event-stream"},
                        ) as response:
                            if response.status_code != 200:
                                error_text = (await response.aread()).decode(errors="ignore")
                                error_msg = f"Dify API错误 (status={response.status_code}): {error_text}"
                                print(f"API错误: {error_msg}")
                                yield f"data: {json.dumps({'error': {'message': error_msg}}, ensure_ascii=False)}\n\n"
                                yield "data: [DONE]\n\n"
                                return

                            print("开始接收 Dify 流式数据...")
                            buffer = ""
                            current_task_id = None
                            async for chunk in response.aiter_text():
                                if chunk:
                                    buffer += chunk
                                    # 处理完整的行
                                    while '\n' in buffer:
                                        line, buffer = buffer.split('\n', 1)
                                        if line.strip():
                                            if line.startswith('data: '):
                                                # 解析 Dify 事件，转换为 OpenAI/DeepSeek 风格 delta
                                                try:
                                                    data = line[6:].strip()
                                                    if not data or data == '[DONE]':
                                                        pass
                                                    else:
                                                        parsed = json.loads(data)
                                                        event = parsed.get('event')

                                                        # 尽早把 task_id 传给前端，便于立即停止
                                                        if parsed.get('task_id') and parsed.get('task_id') != current_task_id:
                                                            current_task_id = parsed.get('task_id')
                                                            task_info = {"type": "task", "task_id": current_task_id}
                                                            yield f"data: {json.dumps(task_info, ensure_ascii=False)}\n\n"

                                                        if event == 'message':
                                                            # 追加内容
                                                            delta_text = parsed.get('answer', '')
                                                            if delta_text:
                                                                full_content += delta_text
                                                                transformed = {
                                                                    "choices": [
                                                                        {"delta": {"content": delta_text}}
                                                                    ]
                                                                }
                                                                # 若已知 task_id，一并携带
                                                                if current_task_id:
                                                                    transformed["task_id"] = current_task_id
                                                                yield f"data: {json.dumps(transformed, ensure_ascii=False)}\n\n"
                                                            # 记录会话ID（如有）
                                                            if parsed.get('conversation_id'):
                                                                dify_conversation_id = parsed['conversation_id']
                                                            # 记录task_id（如有）
                                                            if current_task_id:
                                                                print(f"📋 从Dify获取到task_id: {current_task_id}")

                                                        elif event == 'message_file':
                                                            # 文件事件映射到前端可识别的自定义文件块
                                                            file_url = parsed.get('url')
                                                            file_type = parsed.get('type')
                                                            file_block = {
                                                                "type": "file",
                                                                "filename": f"{file_type}-{parsed.get('id')}",
                                                                "url": file_url,
                                                                "mime_type": "application/octet-stream",
                                                                "conversation_id": parsed.get('conversation_id') or dify_conversation_id,
                                                            }
                                                            yield f"data: {json.dumps(file_block, ensure_ascii=False)}\n\n"

                                                        elif event == 'message_end':
                                                            # 结束事件，保存会话ID
                                                            if parsed.get('conversation_id'):
                                                                dify_conversation_id = parsed['conversation_id']
                                                            # 不直接输出给前端（保持原有协议），将在结尾统一发 [DONE]

                                                        elif event in ('workflow_started', 'node_started', 'node_finished', 'workflow_finished', 'tts_message', 'tts_message_end', 'message_replace', 'ping'):
                                                            # 可选：忽略或在调试时打印
                                                            pass

                                                        elif event == 'error' or parsed.get('error'):
                                                            err_msg = parsed.get('message') or parsed.get('error') or '未知错误'
                                                            error_response = {"error": {"message": f"Dify 错误: {err_msg}"}}
                                                            yield f"data: {json.dumps(error_response, ensure_ascii=False)}\n\n"
                                                            yield "data: [DONE]\n\n"
                                                            return
                                                except Exception as e:
                                                    # 解析异常时忽略该行
                                                    print(f"解析Dify流式数据行失败: {e}")
                                                    pass
                            
                            # 处理剩余的buffer（无需额外转发）
                            if buffer.strip():
                                try:
                                    rem = buffer
                                    if rem.startswith('data: '):
                                        data = rem[6:].strip()
                                        if data and data != '[DONE]':
                                            parsed = json.loads(data)
                                            if parsed.get('event') == 'message':
                                                delta_text = parsed.get('answer', '')
                                                if delta_text:
                                                    full_content += delta_text
                                                    transformed = {"choices": [{"delta": {"content": delta_text}}]}
                                                    yield f"data: {json.dumps(transformed, ensure_ascii=False)}\n\n"
                                except Exception:
                                    pass
                            
                            # 将完整的AI回复存入数据库（始终使用本地会话ID）
                            if full_content:
                                ai_message_id = await db.add_message(
                                    conversation_id=conversation_id,
                                    role="assistant",
                                    content=full_content
                                )
                                print(f"添加AI回复到数据库: {ai_message_id}")
                            
                            # 生成文件（如果需要）
                            if request.output_format != "text" and full_content.strip():
                                print(f"生成{request.output_format}文件...")
                                file_info = await generate_file(full_content, request.output_format)
                                if file_info:
                                    # 存储生成的文件信息到数据库
                                    if ai_message_id:
                                        file_db_id = await db.add_generated_file(
                                            message_id=ai_message_id,
                                            filename=file_info["filename"],
                                            file_path=os.path.join(GENERATED_DIR, file_info["filename"]),
                                            mime_type=file_info["mime_type"],
                                            format=request.output_format
                                        )
                                        print(f"添加生成的文件到数据库: {file_db_id}")
                                    
                                    # 向客户端发送文件信息
                                    file_data = {
                                        "type": "file",
                                        "filename": file_info["filename"],
                                        "url": file_info["url"],
                                        "mime_type": file_info["mime_type"],
                                        "conversation_id": dify_conversation_id or conversation_id
                                    }
                                    yield f"data: {json.dumps(file_data)}\n\n"
                            
                            # 向客户端发送对话ID（本地与 Dify）
                            conversation_data = {
                                "type": "conversation",
                                "conversation_id": conversation_id,  # 本地数据库会话ID
                                "dify_conversation_id": dify_conversation_id or ""
                            }
                            yield f"data: {json.dumps(conversation_data)}\n\n"
                            
                            yield "data: [DONE]\n\n"
                except httpx.StreamClosed:
                    print("流连接被关闭")
                    error_response = {
                        "error": {
                            "message": "Stream was closed unexpectedly"
                        }
                    }
                    yield f"data: {json.dumps(error_response)}\n\n"
                    yield "data: [DONE]\n\n"
                except Exception as e:
                    print(f"流式处理错误: {str(e)}")
                    error_response = {
                        "error": {
                            "message": f"流式处理错误: {str(e)}"
                        }
                    }
                    yield f"data: {json.dumps(error_response)}\n\n"
                    yield "data: [DONE]\n\n"
            
            return StreamingResponse(generate(), media_type="text/event-stream")
        
        else:
            # 普通（阻塞）响应
            print("发送请求到 Dify API（阻塞模式）...")
            print(f"请求数据: {json.dumps(dify_payload, ensure_ascii=False, indent=2)}")
            
            async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
                response = await client.post(
                    f"{DIFY_API_BASE}/chat-messages",
                    json=dify_payload,
                    headers=headers,
                )
                
                print(f"收到响应，状态码: {response.status_code}")
                if response.status_code != 200:
                    error_text = response.text
                    print(f"Dify API 错误详情: {error_text}")
                    raise HTTPException(status_code=response.status_code, 
                                      detail=f"Dify API错误 (status={response.status_code}): {error_text}")
                
                dify_data = response.json()
                print(f"响应数据: {json.dumps(dify_data, ensure_ascii=False, indent=2)}")

                # Dify -> 前端兼容结构
                ai_content = dify_data.get('answer', '')
                # 存储AI回复到数据库（始终使用本地会话ID）
                if ai_content:
                    ai_message_id = await db.add_message(
                        conversation_id=conversation_id,
                        role="assistant",
                        content=ai_content
                    )
                    print(f"添加AI回复到数据库: {ai_message_id}")

                # 生成文件（如果需要）
                file_info = None
                if request.output_format != "text" and ai_content.strip():
                    print(f"生成{request.output_format}文件...")
                    file_info = await generate_file(ai_content, request.output_format)
                    if file_info and ai_content:
                        # 存储生成的文件信息到数据库
                        await db.add_generated_file(
                            message_id=ai_message_id,
                            filename=file_info["filename"],
                            file_path=os.path.join(GENERATED_DIR, file_info["filename"]),
                            mime_type=file_info["mime_type"],
                            format=request.output_format
                        )
                        print("生成文件已写入数据库")

                # 构造兼容的返回体
                # 读取 Dify 的会话ID用于前端持续对话
                dify_conversation_id_resp = dify_data.get('conversation_id') or ""

                compatible = {
                    "id": dify_data.get('id', str(uuid.uuid4())),
                    "object": "chat.completion",
                    "created": int(datetime.now().timestamp()),
                    "model": request.model,
                    "choices": [
                        {
                            "index": 0,
                            "message": {"role": "assistant", "content": ai_content},
                            "finish_reason": "stop",
                        }
                    ],
                    "usage": dify_data.get('metadata', {}).get('usage', {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0,
                    }),
                    # 对前端：conversation_id 为本地会话ID；另返回 dify_conversation_id
                    "conversation_id": conversation_id,
                    "dify_conversation_id": dify_conversation_id_resp,
                }

                if file_info:
                    compatible['file'] = file_info

                return compatible
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="请求超时")
    except httpx.RequestError as e:
        print(f"网络请求错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"网络请求错误: {str(e)}")
    except Exception as e:
        print(f"服务器内部错误: {str(e)}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@app.post("/api/chat/stop/{task_id}")
async def stop_chat_response(task_id: str):
    """
    停止指定的Dify响应任务
    """
    if not DIFY_API_KEY:
        raise HTTPException(status_code=500, detail="Dify API密钥未配置")
    
    try:
        print(f"停止响应任务: {task_id}")
        
        # 调用Dify API停止响应
        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 构造候选停止端点（不同网关/版本可能不同）
        # 为了兼容性，不再区分 channel，全部都尝试
        base_candidates = [
            f"{DIFY_API_BASE}/chat-messages/{task_id}/stop",
            f"{DIFY_API_BASE}/workflows/{task_id}/stop",
            f"{DIFY_API_BASE}/workflows/tasks/{task_id}/stop",
            f"{DIFY_API_BASE}/tasks/{task_id}/stop",
        ]
        # 同时加入带斜杠版本，解决 308 重定向（有些网关要求以 / 结尾）
        candidate_urls = []
        for u in base_candidates:
            candidate_urls.append(u)
            if not u.endswith('/'):
                candidate_urls.append(u + '/')

        last_status = None
        last_text = None
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            for stop_url in candidate_urls:
                try:
                    print(f"尝试停止 URL: {stop_url}")
                    user_val = "abc-123"
                    # 按文档先用 JSON body
                    response = await client.post(stop_url, headers={**headers, "Accept": "application/json"}, json={"user": user_val})
                    last_status = response.status_code
                    last_text = response.text
                    print(f"停止返回: {last_status} {last_text[:200]}")
                    if response.status_code in (200, 204):
                        try:
                            dify_response = response.json()
                        except Exception:
                            dify_response = {"result": "success"}
                        return {
                            "success": True,
                            "result": dify_response.get("result", "success"),
                            "message": "响应已成功停止"
                        }

                    # 再尝试 Query 方式 ?user=xxx（部分网关可能这样要求）
                    response = await client.post(stop_url, headers=headers, params={"user": user_val})
                    last_status = response.status_code
                    last_text = response.text
                    print(f"停止返回(带query): {last_status} {last_text[:200]}")
                    if response.status_code in (200, 204):
                        try:
                            dify_response = response.json()
                        except Exception:
                            dify_response = {"result": "success"}
                        return {
                            "success": True,
                            "result": dify_response.get("result", "success"),
                            "message": "响应已成功停止"
                        }

                    # 再尝试自定义 Header 方式 X-User（防御性兼容）
                    response = await client.post(stop_url, headers={**headers, "X-User": user_val})
                    last_status = response.status_code
                    last_text = response.text
                    print(f"停止返回(带X-User): {last_status} {last_text[:200]}")
                    if response.status_code in (200, 204):
                        try:
                            dify_response = response.json()
                        except Exception:
                            dify_response = {"result": "success"}
                        return {
                            "success": True,
                            "result": dify_response.get("result", "success"),
                            "message": "响应已成功停止"
                        }
                except Exception as e:
                    print(f"调用 {stop_url} 出错: {e}")

        raise HTTPException(
            status_code=500 if (last_status is None or last_status == 200) else last_status,
            detail=f"停止响应失败: {last_text or '未知错误'}"
        )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="停止响应请求超时")
    except httpx.RequestError as e:
        print(f"停止响应网络错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"网络错误: {str(e)}")
    except Exception as e:
        print(f"停止响应内部错误: {str(e)}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), message_id: Optional[str] = Form(None), conversation_id: Optional[str] = Form(None)):
    """
    上传文件
    
    如果提供了message_id，则将文件关联到指定消息
    如果提供了conversation_id但没有message_id，则创建一个新的系统消息并关联文件
    """
    try:
        # 验证文件类型
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.xlsx', '.xls', '.pptx', '.ppt'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="不支持的文件类型")
        
        # 验证文件大小 (50MB)
        content = await file.read()
        file_size = len(content)
        if file_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="文件大小超过50MB限制")
        
        # 生成唯一文件名
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        
        # 保存文件
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # 处理数据库存储
        attachment_id = None
        
        if message_id:
            # 将文件关联到现有消息
            attachment_id = await db.add_attachment(
                message_id=message_id,
                filename=file.filename,
                file_path=file_path,
                mime_type=file.content_type
            )
            print(f"文件 {file.filename} 关联到消息 {message_id}, 附件ID: {attachment_id}")
            
        elif conversation_id:
            # 验证对话是否存在
            conversation = await db.get_conversation(conversation_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="指定的对话不存在")
            
            # 创建一个系统消息并关联文件
            system_message_id = await db.add_message(
                conversation_id=conversation_id,
                role="system",
                content=f"上传了文件: {file.filename}"
            )
            
            attachment_id = await db.add_attachment(
                message_id=system_message_id,
                filename=file.filename,
                file_path=file_path,
                mime_type=file.content_type
            )
            print(f"文件 {file.filename} 关联到新的系统消息 {system_message_id}, 附件ID: {attachment_id}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": file_size,
            "type": file.content_type,
            "uploaded_at": datetime.now().isoformat(),
            "attachment_id": attachment_id,
            "message_id": message_id,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@app.get("/api/files/{filename}")
async def download_file(filename: str):
    """
    下载生成的文件
    """
    file_path = os.path.join(GENERATED_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 根据文件扩展名设置MIME类型
    if filename.endswith('.pdf'):
        media_type = 'application/pdf'
    elif filename.endswith('.docx'):
        media_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif filename.endswith('.md'):
        media_type = 'text/markdown'
    else:
        media_type = 'application/octet-stream'
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )

@app.get("/api/models")
async def get_available_models():
    """
    获取可用的模型列表
    """
    return {
        "models": [
            {
                "id": "deepseek-chat",
                "name": "DeepSeek Chat",
                "description": "DeepSeek通用对话模型",
                "max_tokens": 8192
            },
            {
                "id": "deepseek-coder",
                "name": "DeepSeek Coder", 
                "description": "DeepSeek代码生成模型",
                "max_tokens": 8192
            }
        ]
    }

@app.get("/api/conversations")
async def get_conversations(
    limit: int = 20, 
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """获取对话列表 - 只返回当前用户的对话"""
    try:
        conversations = await db.get_conversations(
            user_id=current_user["id"], 
            limit=limit, 
            offset=offset
        )
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")

@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """获取对话详情"""
    try:
        conversation = await db.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        messages = await db.get_messages(conversation_id)
        return {
            "conversation": conversation,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取对话详情失败: {str(e)}")

@app.put("/api/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, title: str):
    """更新对话标题"""
    try:
        success = await db.update_conversation_title(conversation_id, title)
        if not success:
            raise HTTPException(status_code=404, detail="对话不存在")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新对话失败: {str(e)}")


@app.post("/api/messages/{message_id}/copy")
async def record_message_copy_event(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """记录消息复制事件"""
    try:
        success = await db.record_message_copy(message_id)
        if success:
            return {"status": "success", "message": "复制事件已记录"}
        else:
            raise HTTPException(status_code=404, detail="消息不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"记录复制事件失败: {str(e)}")

@app.get("/api/messages/{message_id}/copy-stats")
async def get_message_copy_stats(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取消息复制统计信息"""
    try:
        stats = await db.get_message_copy_stats(message_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取复制统计失败: {str(e)}")

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """删除对话"""
    try:
        success = await db.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="对话不存在")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除对话失败: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    """获取统计信息"""
    try:
        stats = await db.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")

# ================================
# 管理员/运营辅助接口：用户与会话
# ================================

@app.get("/api/admin/users", tags=["Admin"])
async def admin_get_users(limit: int = 50, offset: int = 0, admin_user: dict = Depends(get_admin_user)):
    """获取用户列表（仅限管理员：490429443@qq.com）"""
    try:
        users = await db.get_users(limit=limit, offset=offset)
        
        # 为每个用户添加统计信息
        users_with_stats = []
        for user in users:
            # 获取用户的对话和消息
            conversations = await db.get_conversations(user_id=user["id"], limit=1000, offset=0)
            total_messages = 0
            total_copies = 0
            conversations_with_copies = 0
            
            for c in conversations:
                msgs = await db.get_messages(c["id"])
                total_messages += len(msgs)
                
                conversation_copies = 0
                for msg in msgs:
                    if msg.get("role") == "assistant":  # AI消息
                        copy_stats = await db.get_message_copy_stats(msg["id"])
                        copy_count = copy_stats.get("copy_count", 0)
                        conversation_copies += copy_count
                        total_copies += copy_count
                
                if conversation_copies > 0:
                    conversations_with_copies += 1
            
            # 添加统计信息到用户数据
            user_with_stats = dict(user)
            user_with_stats["stats"] = {
                "conversations": len(conversations),
                "messages": total_messages,
                "total_copies": total_copies,
                "conversations_with_copies": conversations_with_copies
            }
            users_with_stats.append(user_with_stats)
        
        return {"users": users_with_stats, "limit": limit, "offset": offset}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户列表失败: {str(e)}")

@app.get("/api/admin/users/{user_id}", tags=["Admin"])
async def admin_get_user_detail(user_id: str, admin_user: dict = Depends(get_admin_user)):
    """获取单个用户详情及其对话统计（仅限管理员：490429443@qq.com）"""
    try:
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        conversations = await db.get_conversations(user_id=user_id, limit=1000, offset=0)
        total_messages = 0
        total_copies = 0
        conversations_with_copies = 0
        
        # 为每个对话添加复制统计
        detailed_conversations = []
        for c in conversations:
            msgs = await db.get_messages(c["id"])  # 每个会话的消息
            total_messages += len(msgs)
            
            # 统计这个对话的复制信息
            conversation_copies = 0
            ai_messages_with_copies = 0
            
            for msg in msgs:
                if msg.get("role") == "assistant":  # AI消息
                    copy_stats = await db.get_message_copy_stats(msg["id"])
                    copy_count = copy_stats.get("copy_count", 0)
                    conversation_copies += copy_count
                    total_copies += copy_count
                    if copy_count > 0:
                        ai_messages_with_copies += 1
            
            # 添加复制统计到对话信息
            conv_with_stats = dict(c)
            conv_with_stats.update({
                "message_count": len(msgs),
                "total_copies": conversation_copies,
                "ai_messages_with_copies": ai_messages_with_copies
            })
            detailed_conversations.append(conv_with_stats)
            
            if conversation_copies > 0:
                conversations_with_copies += 1

        return {
            "user": user,
            "stats": {
                "conversations": len(conversations), 
                "messages": total_messages,
                "total_copies": total_copies,
                "conversations_with_copies": conversations_with_copies
            },
            "conversations": detailed_conversations,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户详情失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)