/**
 * 本地存储工具函数
 * 用于保存和恢复聊天记录
 */

export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  generatedFile?: {
    filename: string;
    url: string;
    mime_type: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
  // 后端本地数据库会话ID
  dbConversationId?: string;
  // Dify 的会话ID
  difyConversationId?: string;
}

const STORAGE_KEYS = {
  CONVERSATIONS: 'prd-ai-conversations',
  ACTIVE_CONVERSATION_ID: 'prd-ai-active-conversation-id',
  SIDEBAR_COLLAPSED: 'prd-ai-sidebar-collapsed',
  SELECTED_MODEL: 'prd-ai-selected-model',
  IS_STREAMING: 'prd-ai-is-streaming',
  OUTPUT_FORMAT: 'prd-ai-output-format'
} as const;

/**
 * 安全的JSON解析，处理Date对象的反序列化
 */
function safeJSONParse<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;

  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // 处理Date对象的反序列化
      if (key === 'timestamp' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
    return parsed;
  } catch (error) {
    console.warn('解析localStorage数据失败:', error);
    return defaultValue;
  }
}

/**
 * 安全的JSON序列化
 */
function safeJSONStringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('序列化数据失败:', error);
    return '{}';
  }
}

/**
 * 保存对话列表到本地存储
 */
export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, safeJSONStringify(conversations));
  } catch (error) {
    console.error('保存对话列表失败:', error);
  }
}

/**
 * 获取默认对话数据（需要传入翻译函数）
 */
export function getDefaultConversations(t: any): Conversation[] {
  return [
    {
      id: "1",
      title: t.chat.defaultConversationTitle,
      timestamp: new Date(),
      preview: t.chat.defaultConversationPreview,
      messages: [
        {
          id: "1",
          type: "ai",
          content: t.chat.defaultWelcomeMessage,
          timestamp: new Date(),
        }
      ]
    }
  ];
}

/**
 * 从本地存储加载对话列表
 */
export function loadConversations(): Conversation[] {
  // 临时使用硬编码的默认对话，实际使用时应该通过getDefaultConversations获取
  const defaultConversations: Conversation[] = [
    {
      id: "1",
      title: "PRD For AI",
      timestamp: new Date(),
      preview: "欢迎使用 PRD For AI 产品设计对话助手",
      messages: [
        {
          id: "1",
          type: "ai",
          content: "欢迎使用 PRD For AI！\n\n我是你的产品设计与文档助手，帮助你：\n\n**核心功能:**\n• 🧭 需求澄清与用户画像\n• 🧩 功能拆解与优先级\n• 📄 PRD/BRD/需求文档生成与评审\n• 📎 文件上传与洞察提炼\n• 💬 多轮对话与版本管理\n\n开始对我说：例如\"为一个 AI 会议纪要工具产出 PRD 结构\"。",
          timestamp: new Date(),
        }
      ]
    }
  ];

  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  const conversations = safeJSONParse(stored, defaultConversations);

  // 验证数据格式，确保数据完整性
  if (!Array.isArray(conversations) || conversations.length === 0) {
    return defaultConversations;
  }

  return conversations;
}

/**
 * 保存当前活跃对话ID
 */
export function saveActiveConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, id);
  } catch (error) {
    console.error('保存活跃对话ID失败:', error);
  }
}

/**
 * 加载当前活跃对话ID
 */
export function loadActiveConversationId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID) || "1";
}

/**
 * 保存侧边栏折叠状态
 */
export function saveSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed));
  } catch (error) {
    console.error('保存侧边栏状态失败:', error);
  }
}

/**
 * 加载侧边栏折叠状态
 */
export function loadSidebarCollapsed(): boolean {
  return safeJSONParse(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED), false);
}

/**
 * 保存选择的模型
 */
export function saveSelectedModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
  } catch (error) {
    console.error('保存模型选择失败:', error);
  }
}

/**
 * 加载选择的模型
 */
export function loadSelectedModel(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || "deepseek-chat";
}

/**
 * 保存流式传输设置
 */
export function saveIsStreaming(isStreaming: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_STREAMING, JSON.stringify(isStreaming));
  } catch (error) {
    console.error('保存流式传输设置失败:', error);
  }
}

/**
 * 加载流式传输设置
 */
export function loadIsStreaming(): boolean {
  return safeJSONParse(localStorage.getItem(STORAGE_KEYS.IS_STREAMING), true);
}

/**
 * 保存输出格式设置
 */
export function saveOutputFormat(format: "text" | "pdf" | "docx" | "markdown"): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OUTPUT_FORMAT, format);
  } catch (error) {
    console.error('保存输出格式设置失败:', error);
  }
}

/**
 * 加载输出格式设置
 */
export function loadOutputFormat(): "text" | "pdf" | "docx" | "markdown" {
  const stored = localStorage.getItem(STORAGE_KEYS.OUTPUT_FORMAT);
  return (stored as "text" | "pdf" | "docx" | "markdown") || "text";
}

/**
 * 清除所有存储的数据（用于重置应用）
 */
export function clearAllStoredData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('清除存储数据失败:', error);
  }
}

/**
 * 获取存储使用情况（调试用）
 */
export function getStorageUsage(): { [key: string]: number } {
  const usage: { [key: string]: number } = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    usage[name] = value ? new Blob([value]).size : 0;
  });

  return usage;
}
