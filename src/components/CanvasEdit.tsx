import { useState, useRef } from "react";
import { Copy, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CanvasEditProps {
  content: string;
  onClose: () => void;
  title?: string;
}

export function CanvasEdit({ content, onClose, title = "画布编辑" }: CanvasEditProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* 左侧聊天界面预览区域 */}
      <div className="w-96 border-r bg-aurora flex flex-col">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between p-4 border-b">
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

        {/* 聊天预览区域 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="bg-transparent border border-border rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-2">AI助手</div>
              <div className="text-sm leading-relaxed">
                {content.substring(0, 200)}
                {content.length > 200 && "..."}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            在右侧画布中编辑完整文档内容
          </div>
        </div>
      </div>

      {/* 右侧画布编辑区域 */}
      <div className="flex-1 flex flex-col bg-background">
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