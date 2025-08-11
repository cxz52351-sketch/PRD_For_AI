// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// 类型定义
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  output_format?: string;
  conversation_id?: string; // 本地数据库对话ID
  dify_conversation_id?: string; // Dify 会话ID
}

export interface FileResponse {
  filename: string;
  url: string;
  mime_type: string;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  file?: FileResponse;
  conversation_id?: string;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  size: number;
  type: string;
  uploaded_at: string;
  attachment_id?: string;
  message_id?: string;
  conversation_id?: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  max_tokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  model: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: {
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
    attachments?: Array<{
      id: string;
      message_id: string;
      filename: string;
      file_path: string;
      mime_type: string;
      created_at: string;
    }>;
    generated_files?: Array<{
      id: string;
      message_id: string;
      filename: string;
      file_path: string;
      mime_type: string;
      format: string;
      created_at: string;
    }>;
  }[];
}

// API错误类
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 通用请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // 如果无法解析JSON，使用默认错误消息
    }

    throw new APIError(errorMessage, response.status);
  }

  return response.json();
}

// 流式请求函数
export async function streamRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<ReadableStream<Uint8Array>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // 如果无法解析JSON，使用默认错误消息
    }

    throw new APIError(errorMessage, response.status);
  }

  return response.body!;
}

// API函数
export const api = {
  // 健康检查
  health: () => apiRequest<{ status: string; timestamp: string }>('/health'),

  // 获取可用模型
  getModels: () => apiRequest<{ models: Model[] }>('/api/models'),

  // 聊天对话
  chat: (request: ChatRequest) =>
    apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // 流式聊天对话
  chatStream: (request: ChatRequest) =>
    streamRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: true }),
    }),

  // 上传文件
  uploadFile: async (file: File, messageId?: string, conversationId?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    if (messageId) {
      formData.append('message_id', messageId);
    }

    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

    const url = `${API_BASE_URL}/api/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // 如果无法解析JSON，使用默认错误消息
      }

      throw new APIError(errorMessage, response.status);
    }

    return response.json();
  },

  // 下载文件
  downloadFile: (url: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}${url}`;
    link.target = '_blank';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 获取对话列表
  getConversations: (limit: number = 20, offset: number = 0) =>
    apiRequest<{ conversations: Conversation[] }>(`/api/conversations?limit=${limit}&offset=${offset}`),

  // 获取对话详情
  getConversation: (conversationId: string) =>
    apiRequest<ConversationDetail>(`/api/conversations/${conversationId}`),

  // 更新对话标题
  updateConversationTitle: (conversationId: string, title: string) =>
    apiRequest<{ status: string }>(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }),

  // 删除对话
  deleteConversation: (conversationId: string) =>
    apiRequest<{ status: string }>(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    }),

  // 获取统计信息
  getStats: () =>
    apiRequest<{ conversations: number, messages: number, attachments: number, generated_files: number }>('/api/stats'),
};

// 流式响应解析器
export function parseStreamResponse(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理完整的行
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                yield parsed;
              } catch (e) {
                console.warn('解析流式响应失败:', data, e);
                // 忽略无法解析的JSON
              }
            }
          }
        }

        // 处理剩余的buffer
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.warn('解析剩余buffer失败:', data, e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}