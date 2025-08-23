import { useState, useRef, useCallback, useEffect } from "react";
import { Copy, Check, X, ArrowLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface CanvasEditProps {
  content: string;
  onClose: () => void;
  title?: string;
  messages?: Message[];
}

export function CanvasEdit({ 
  content, 
  onClose, 
  title = "画布编辑",
  messages = []
}: CanvasEditProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [leftWidth, setLeftWidth] = useState(380); // 初始左侧宽度
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      });
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = e.clientX - containerRect.left;
    
    // 限制最小和最大宽度
    const minWidth = 280;
    const maxWidth = containerRect.width - 400;
    
    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      setLeftWidth(newLeftWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-background z-50 flex">
      {/* 左侧对话历史区域 */}
      <div 
        className="border-r bg-aurora flex flex-col"
        style={{ width: leftWidth }}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-background/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-medium text-sm">PRD For AI</h2>
          </div>
        </div>

        {/* 对话历史区域 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "flex gap-3 p-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "rounded-lg p-3 max-w-[85%] shadow-sm",
                  message.type === "user"
                    ? "bg-ai-message text-foreground ml-auto"
                    : "bg-transparent border border-border text-foreground"
                )}>
                  <div className="prose max-w-none prose-sm prose-p:leading-relaxed prose-zinc dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const isInline = !className;
                          
                          if (isInline) {
                            return (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                          
                          return (
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                              <code {...props}>{children}</code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {message.content.length > 200 
                        ? message.content.substring(0, 200) + "..." 
                        : message.content
                      }
                    </ReactMarkdown>
                  </div>
                  
                  <div className="text-xs mt-2 text-muted-foreground opacity-70">
                    {message.type === "user" ? "用户" : "AI助手"} • {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            在右侧画布中编辑完整文档内容
          </div>
        </div>
      </div>

      {/* 拖拽分隔条 */}
      <div
        className={cn(
          "w-1 bg-border hover:bg-border/80 cursor-col-resize flex items-center justify-center",
          isResizing && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* 右侧画布编辑区域 */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{title}</h1>
            <span className="text-sm text-muted-foreground">
              {editedContent.length} 字符
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "已复制" : "复制"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 p-4">
          <div className="h-full bg-background rounded-lg border">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="在此编辑文档内容..."
              className={cn(
                "w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent",
                "text-sm leading-relaxed font-mono"
              )}
              style={{
                minHeight: "100%",
                padding: "1.5rem",
              }}
            />
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30 text-xs text-muted-foreground">
          <div>支持Markdown格式</div>
          <div>
            行数: {editedContent.split('\n').length} | 
            字符: {editedContent.length}
          </div>
        </div>
      </div>
    </div>
  );
}