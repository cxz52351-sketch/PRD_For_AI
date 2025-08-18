import { useMemo, useState } from "react";
import { Copy, Check, Download, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
  onRetry?: () => void;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export function ChatMessage({
  type,
  content,
  timestamp,
  isError = false,
  onRetry,
  attachments = []
}: ChatMessageProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set(prev).add(blockIndex));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 预处理：去掉模型“思考/推理”内容与 <details> 包裹的块
  const cleanedContent = useMemo(() => {
    let text = content ?? "";
    // 移除 <details>...</details>
    text = text.replace(/<details[\s\S]*?<\/details>/gi, "");
    // 移除 ```thinking / ```reasoning / ```思考 等代码块
    text = text.replace(/```(?:thinking|reasoning|thoughts|思考|推理)[\s\S]*?```/gi, "");
    // 移除行内 [思考] 或 (思考中...) 前缀
    text = text.replace(/^\s*(?:\[?思考\]?|\[?Thinking\]?|\[?Reasoning\]?):.*$/gim, "");
    return text.trim();
  }, [content]);

  const renderContent = () => {
    if (isError) {
      return (
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>⚠️ 调用失败</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              重试
            </Button>
          )}
        </div>
      );
    }

    // 使用 ReactMarkdown 以正确渲染标题/列表/表格等
    let blockIndex = 0;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = (match?.[1] || "").toLowerCase();
            const codeText = String(children ?? "");
            const current = blockIndex++;

            // 以是否包含换行粗略判断是否为块级代码
            const isBlock = /\n/.test(codeText);

            if (isBlock && language === "mermaid") {
              return (
                <div className="my-4">
                  <div className="flex items-center justify-between bg-code-background text-gray-600 dark:text-gray-300 px-4 py-2 rounded-t-lg text-sm">
                    <span>mermaid</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      onClick={() => copyToClipboard(codeText, current)}
                    >
                      {copiedBlocks.has(current) ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="bg-code-background text-gray-800 dark:text-gray-100 p-4 rounded-b-lg overflow-x-auto">
                    <code {...props}>{codeText}</code>
                  </pre>
                </div>
              );
            }

            if (isBlock) {
              return (
                <div className="my-4">
                  <div className="flex items-center justify-between bg-code-background text-gray-600 dark:text-gray-300 px-4 py-2 rounded-t-lg text-sm">
                    <span>{language || "text"}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      onClick={() => copyToClipboard(codeText, current)}
                    >
                      {copiedBlocks.has(current) ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="bg-code-background text-gray-800 dark:text-gray-100 p-4 rounded-b-lg overflow-x-auto">
                    <code {...props}>{codeText}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          a({ children, href }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="underline text-primary">
                {children}
              </a>
            );
          },
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    );
  };

  return (
    <div className={cn(
      "flex gap-4 p-4 max-w-none",
      type === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-4 shadow-sm",
        type === "user"
          ? "bg-ai-message text-foreground ml-auto"
          : "bg-transparent border border-border text-foreground"
      )}>
        <div className={cn(
          "prose max-w-none prose-p:leading-relaxed prose-li:leading-relaxed prose-zinc dark:prose-invert prose-headings:text-foreground",
          type === "ai" ? "prose-sm" : undefined
        )}>
          {renderContent()}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded border">
                <span className="text-sm truncate flex-1">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className={cn(
          "text-xs mt-3 text-muted-foreground opacity-70"
        )}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}