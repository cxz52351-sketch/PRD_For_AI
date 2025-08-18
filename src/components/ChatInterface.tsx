import { useState, useRef, useEffect } from "react";
import { Download, Settings, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";
import { api, parseStreamResponse, type Message as APIMessage } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  saveConversations,
  loadConversations,
  saveActiveConversationId,
  loadActiveConversationId,
  saveSidebarCollapsed,
  loadSidebarCollapsed,
  saveSelectedModel,
  loadSelectedModel,
  saveIsStreaming,
  loadIsStreaming,
  saveOutputFormat,
  loadOutputFormat,
  clearAllStoredData,
  type Conversation as StoredConversation,
  type Message as StoredMessage
} from "@/lib/storage";

// 使用存储模块中的类型定义
type Message = StoredMessage;
type Conversation = StoredConversation;

export function ChatInterface() {
  // 从本地存储初始化状态
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    return loaded;
  });
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const stored = loadActiveConversationId();
    // 验证存储的ID是否有效
    const loadedConversations = loadConversations();
    return loadedConversations.some(conv => conv.id === stored) ? stored : "1";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => loadSidebarCollapsed());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => loadSelectedModel());
  const [isStreaming, setIsStreaming] = useState<boolean>(() => loadIsStreaming());
  const [outputFormat, setOutputFormat] = useState<"text" | "pdf" | "docx" | "markdown">(() => loadOutputFormat());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 在首次加载时显示恢复提示
  useEffect(() => {
    const hasStoredData = localStorage.getItem('prd-ai-conversations');
    if (hasStoredData && conversations.length > 1) {
      toast({
        title: "数据已恢复",
        description: "您之前的聊天记录已从本地存储恢复",
        duration: 3000,
      });
    }
  }, []); // 只在组件首次挂载时执行

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // 自动保存对话列表到本地存储
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // 自动保存当前活跃对话ID
  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  // 自动保存侧边栏状态
  useEffect(() => {
    saveSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  // 自动保存模型选择
  useEffect(() => {
    saveSelectedModel(selectedModel);
  }, [selectedModel]);

  // 自动保存流式传输设置
  useEffect(() => {
    saveIsStreaming(isStreaming);
  }, [isStreaming]);

  // 自动保存输出格式设置
  useEffect(() => {
    saveOutputFormat(outputFormat);
  }, [outputFormat]);

  const generateConversationTitle = (content: string): string => {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 30 ? firstLine.substring(0, 30) + "..." : firstLine;
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    setIsLoading(true);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content,
      timestamp: new Date(),
      attachments: files?.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversationId
        ? {
          ...conv,
          messages: [...conv.messages, userMessage],
          title: conv.messages.length === 0 ? generateConversationTitle(content) : conv.title,
          timestamp: new Date(),
          preview: content.length > 50 ? content.substring(0, 50) + "..." : content
        }
        : conv
    ));

    try {
      // 准备发送给API的消息历史
      const conversationMessages: APIMessage[] = activeConversation?.messages
        .filter(msg => msg.type === "user" || msg.type === "ai")
        .map(msg => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content
        })) || [];

      // 添加当前用户消息
      conversationMessages.push({
        role: "user",
        content: content
      });

      // 创建AI消息占位符
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        type: "ai",
        content: "",
        timestamp: new Date(),
      };

      // 先添加空的AI消息
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, aiMessage] }
          : conv
      ));

      if (isStreaming) {
        // 流式响应
        const stream = await api.chatStream({
          messages: conversationMessages,
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 4000,
          stream: true,
          output_format: outputFormat,
          conversation_id: activeConversation?.dbConversationId,
          dify_conversation_id: activeConversation?.difyConversationId,
        });

        const parser = parseStreamResponse(stream);

        for await (const chunk of parser) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;

            // 更新消息内容
            setConversations(prev => prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + content }
                      : msg
                  )
                }
                : conv
            ));
          } else if (chunk.type === "file") {
            // 处理生成的文件
            setConversations(prev => prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === aiMessageId
                      ? {
                        ...msg,
                        generatedFile: {
                          filename: chunk.filename,
                          url: chunk.url,
                          mime_type: chunk.mime_type
                        }
                      }
                      : msg
                  )
                }
                : conv
            ));

            toast({
              title: "文件生成成功",
              description: `已生成文件：${chunk.filename}`,
            });
          } else if (chunk.type === "conversation") {
            // 更新当前会话的本地与 Dify 会话ID
            setConversations(prev => prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  dbConversationId: chunk.conversation_id || conv.dbConversationId,
                  difyConversationId: chunk.dify_conversation_id || conv.difyConversationId,
                }
                : conv
            ));
          }
        }
      } else {
        // 普通响应
        const response = await api.chat({
          messages: conversationMessages,
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false,
          output_format: outputFormat,
          conversation_id: activeConversation?.dbConversationId,
          dify_conversation_id: activeConversation?.difyConversationId,
        });

        // 更新AI消息内容
        setConversations(prev => prev.map(conv =>
          conv.id === activeConversationId
            ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === aiMessageId
                  ? {
                    ...msg,
                    content: response.choices[0]?.message?.content || "抱歉，我无法生成回复。",
                    generatedFile: response.file
                  }
                  : msg
              )
              ,
              dbConversationId: response.conversation_id || conv.dbConversationId,
              difyConversationId: (response as any).dify_conversation_id || conv.difyConversationId
            }
            : conv
        ));

        if (response.file) {
          toast({
            title: "文件生成成功",
            description: `已生成文件：${response.file.filename}`,
          });
        }
      }

    } catch (error) {
      console.error('发送消息失败:', error);

      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: error instanceof Error ? error.message : "调用失败",
        timestamp: new Date(),
        isError: true,
      };

      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ));

      toast({
        title: "发送失败",
        description: error instanceof Error ? error.message : "网络连接异常，请检查网络后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "新对话",
      timestamp: new Date(),
      preview: "开始新的对话...",
      messages: []
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      // 立即保存到本地存储
      saveConversations(updated);
      return updated;
    });
    setActiveConversationId(newId);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== id);
      // 立即保存到本地存储
      saveConversations(updated);
      return updated;
    });

    // If deleting active conversation, switch to another one
    if (id === activeConversationId) {
      const remaining = conversations.filter(conv => conv.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  const handleRetryMessage = () => {
    if (!activeConversation) return;

    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find(msg => msg.type === "user");

    if (lastUserMessage) {
      // Remove the last error message
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: conv.messages.slice(0, -1) }
          : conv
      ));

      // Retry sending
      const files = lastUserMessage.attachments?.map(att => {
        // Note: In a real app, you'd need to store the actual File objects
        return new File([], att.name, { type: att.type });
      });

      handleSendMessage(lastUserMessage.content, files);
    }
  };

  const handleExportConversation = () => {
    if (!activeConversation) return;

    const markdown = `# ${activeConversation.title}\n\n` +
      activeConversation.messages.map(msg =>
        `## ${msg.type === 'user' ? '用户' : 'AI助手'} (${msg.timestamp.toLocaleString()})\n\n${msg.content}\n`
      ).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "导出成功",
      description: "对话已导出为Markdown文件",
    });
  };

  const handleClearAllData = () => {
    if (confirm('确定要清除所有聊天记录吗？此操作不可撤销。')) {
      clearAllStoredData();
      // 重新加载默认数据
      const defaultConversations = loadConversations();
      setConversations(defaultConversations);
      setActiveConversationId("1");
      setSidebarCollapsed(false);
      setSelectedModel("deepseek-chat");
      setIsStreaming(true);
      setOutputFormat("text");
      
      toast({
        title: "数据已清除",
        description: "所有聊天记录已被清除",
      });
    }
  };

  const handleDownloadFile = (url: string) => {
    api.downloadFile(url);
  };

  return (
    <div className="flex h-screen bg-aurora">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-transparent">
          <div className="flex items-center gap-3">
            {/* 移除头部Logo，Logo移至侧边栏 */}

          </div>

          <div className="flex gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  {outputFormat === "text" ? "纯文本" : outputFormat.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOutputFormat("text")}>
                  纯文本
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOutputFormat("pdf")}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOutputFormat("docx")}>
                  Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOutputFormat("markdown")}>
                  Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedModel(selectedModel === "deepseek-chat" ? "deepseek-coder" : "deepseek-chat")}
            >
              <Settings className="h-4 w-4 mr-2" />
              {selectedModel === "deepseek-chat" ? "DeepSeek Chat" : "DeepSeek Coder"}
            </Button>
             */}
            
            {/* 开发调试用：清除所有数据按钮 */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllData}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                清除数据
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConversation}
              disabled={!activeConversation?.messages.length}
            >
              <Download className="h-4 w-4 mr-2" />
              导出对话
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {activeConversation?.messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <ChatMessage
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                  isError={message.isError}
                  attachments={message.attachments}
                  onRetry={message.isError ? handleRetryMessage : undefined}
                />
                {message.generatedFile && (
                  <div className="flex items-center gap-2 ml-4">
                    <FileText className="h-4 w-4" />
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => handleDownloadFile(message.generatedFile!.url)}
                    >
                      下载生成的文件：{message.generatedFile.filename}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-ai-message rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>AI正在思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="请说出您的需求"
        />
      </div>
    </div>
  );
}