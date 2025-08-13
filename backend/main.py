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
import db  # 导入数据库模块

# 加载环境变量
load_dotenv()

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

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 4000
    stream: bool = True
    output_format: str = "text"  # text, pdf, docx, markdown
    conversation_id: Optional[str] = None  # 本地数据库对话ID
    dify_conversation_id: Optional[str] = None  # Dify 会话ID，用于与 Dify 持续对话

class ChatResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

# Dify API 配置（默认使用提供的本地网关与密钥）
DIFY_API_BASE = os.getenv("DIFY_API_BASE", "http://localhost/v1")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "app-GFcHLDy1b1h3RjszVIEPXSMX")

if not DIFY_API_KEY:
    print("警告: 未设置DIFY_API_KEY环境变量")

# 文件存储目录
UPLOAD_DIR = "uploads"
GENERATED_DIR = "generated"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

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

@app.post("/api/chat")
async def chat_with_dify(request: ChatRequest):
    """
    通过 Dify 工作流进行对话（兼容现有前端协议）。
    - 流式：将 Dify SSE 事件转换为 OpenAI/DeepSeek 风格的 delta 流
    - 阻塞：将 Dify 的 answer 映射到 choices[0].message.content
    """
    if not DIFY_API_KEY:
        raise HTTPException(status_code=500, detail="Dify API密钥未配置")
    
    try:
        print(f"开始处理聊天请求，Dify API Key: {DIFY_API_KEY[:8]}...")
        
        # 从请求中提取用户消息
        user_message = next((msg for msg in request.messages if msg.role == "user"), None)
        if not user_message:
            raise HTTPException(status_code=400, detail="请求中必须包含用户消息")
        
        # 创建或获取对话ID
        conversation_id = request.conversation_id
        
        if not conversation_id:
            # 创建新对话
            title = user_message.content[:30] + "..." if len(user_message.content) > 30 else user_message.content
            conversation_id = await db.create_conversation(title=title, model=request.model)
            print(f"创建新对话: {conversation_id}")
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
        dify_payload = {
            "inputs": {},
            "query": user_query,
            "response_mode": "streaming" if request.stream else "blocking",
            # 仅将 Dify 会话ID传给 Dify，用于延续上下文
            "conversation_id": (request.dify_conversation_id or ""),
            "user": "abc-123",
        }

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
                    async with httpx.AsyncClient(timeout=60.0) as client:
                        async with client.stream(
                            "POST",
                            f"{DIFY_API_BASE}/chat-messages",
                            json=dify_payload,
                            headers=headers,
                        ) as response:
                            if response.status_code != 200:
                                error_text = await response.aread()
                                error_msg = f"Dify API错误: {error_text.decode()}"
                                print(f"API错误: {error_msg}")
                                yield f"data: {{\"error\": {{\"message\": \"{error_msg}\"}} }}\n\n"
                                yield "data: [DONE]\n\n"
                                return
                            
                            print("开始接收 Dify 流式数据...")
                            buffer = ""
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
                                                                yield f"data: {json.dumps(transformed, ensure_ascii=False)}\n\n"
                                                            # 记录会话ID（如有）
                                                            if parsed.get('conversation_id'):
                                                                dify_conversation_id = parsed['conversation_id']

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
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{DIFY_API_BASE}/chat-messages",
                    json=dify_payload,
                    headers=headers,
                )
                
                print(f"收到响应，状态码: {response.status_code}")
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, 
                                      detail=f"Dify API错误: {response.text}")
                
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
                    "dify_conversation_id": final_conversation_id or "",
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
async def get_conversations(limit: int = 20, offset: int = 0):
    """获取对话列表"""
    try:
        conversations = await db.get_conversations(limit=limit, offset=offset)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)