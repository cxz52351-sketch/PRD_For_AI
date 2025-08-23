import { useState, useRef, useCallback, useEffect } from "react";
import { Copy, Check, X, GripVertical, Download, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasEditProps {
  content: string;
  onClose: () => void;
  title?: string;
  children: React.ReactNode; // 用于传递真实的ChatInterface
}

export function CanvasEdit({ 
  content, 
  onClose, 
  title = "画布编辑",
  children
}: CanvasEditProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [leftWidth, setLeftWidth] = useState(520); // 增加初始左侧宽度
  const [isResizing, setIsResizing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false); // 预览模式状态
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

  const handleDownload = (format: string) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `PRD_${timestamp}`;
    
    if (format === 'markdown') {
      const blob = new Blob([editedContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: "Markdown文件已开始下载",
      });
    } else if (format === 'text') {
      const blob = new Blob([editedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: "文本文件已开始下载",
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
    const minWidth = 320;
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

  return (
    <div ref={containerRef} className="fixed inset-0 bg-background z-50 flex">
      {/* 左侧真实对话界面 */}
      <div 
        className="border-r flex flex-col overflow-hidden bg-background"
        style={{ width: leftWidth }}
      >
        {/* 画布模式指示器 */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
          <div className="text-xs text-muted-foreground">
            画布编辑模式
          </div>
        </div>
        
        {/* 真实的ChatInterface内容 - 使用CSS缩放适应宽度 */}
        <div 
          className="flex-1 overflow-hidden relative bg-background"
          style={{
            transform: leftWidth < 500 ? `scale(${leftWidth / 500})` : 'scale(1)',
            transformOrigin: 'top left',
            width: leftWidth < 500 ? `${500}px` : '100%',
            height: leftWidth < 500 ? `${100 / (leftWidth / 500)}%` : '100%'
          }}
        >
          <div className="absolute inset-0 bg-background">
            {children}
          </div>
        </div>
      </div>

      {/* 拖拽分隔条 */}
      <div
        className={cn(
          "w-1 bg-border hover:bg-border/80 cursor-col-resize flex items-center justify-center relative",
          isResizing && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div className="w-2 h-full hover:bg-primary/10 transition-colors" />
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
            {/* 预览/编辑切换按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="gap-2"
            >
              {isPreviewMode ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  编辑
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  预览
                </>
              )}
            </Button>
            
            {/* 下载按钮 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  下载
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('markdown')}>
                  <Download className="h-4 w-4 mr-2" />
                  下载为 Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('text')}>
                  <Download className="h-4 w-4 mr-2" />
                  下载为 文本 (.txt)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* 复制按钮 */}
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
            
            {/* 关闭按钮 */}
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
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-background rounded-lg border overflow-hidden flex flex-col">
            {isPreviewMode ? (
              <div 
                className={cn(
                  "flex-1 overflow-y-auto overflow-x-hidden p-6",
                  "prose prose-slate dark:prose-invert max-w-none",
                  "prose-headings:text-foreground prose-p:text-foreground",
                  "prose-strong:text-foreground prose-code:text-foreground",
                  "prose-pre:bg-muted prose-pre:text-foreground",
                  "prose-blockquote:text-muted-foreground prose-blockquote:border-l-border"
                )}
                style={{ scrollBehavior: 'smooth' }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-3 ml-4 text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 ml-4 text-foreground">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ inline, children, ...props }) => 
                      inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-muted p-3 rounded font-mono text-sm text-foreground overflow-x-auto" {...props}>
                          {children}
                        </code>
                      ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-3">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {editedContent}
                </ReactMarkdown>
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="在此编辑文档内容..."
                className={cn(
                  "flex-1 resize-none border-0 focus-visible:ring-0 bg-transparent",
                  "text-sm leading-relaxed font-mono"
                )}
                style={{
                  padding: "1.5rem",
                }}
              />
            )}
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>支持Markdown格式</span>
            <span>当前模式: {isPreviewMode ? "预览" : "编辑"}</span>
          </div>
          <div>
            行数: {editedContent.split('\n').length} | 
            字符: {editedContent.length}
          </div>
        </div>
      </div>
    </div>
  );
}