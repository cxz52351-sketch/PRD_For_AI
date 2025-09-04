import { useMemo, useRef, useState } from "react";
import { Copy, Check, Download, AlertTriangle, RotateCcw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/lib/useLanguage";
import { api } from "@/lib/api";

interface ChatMessageProps {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
  onRetry?: () => void;
  onEditInCanvas?: (content: string) => void;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  messageId?: string;
}

export function ChatMessage({
  type,
  content,
  timestamp,
  isError = false,
  onRetry,
  onEditInCanvas,
  attachments = []
,
  messageId}: ChatMessageProps) {
  const { t } = useTranslation();
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());
  const [messageCopied, setMessageCopied] = useState(false);
  const [showCopyBtn, setShowCopyBtn] = useState(false); // 仅用于用户气泡
  const hideCopyTimerRef = useRef<number | null>(null);

  // 判断是否显示"在画布中编辑"按钮
  const shouldShowEditInCanvas = () => {
    if (type !== "ai" || isError || !content) return false;

    // 检查内容是否包含PRD文档的关键特征
    const prdIndicators = [
      "产品需求文档",
      "PRD",
      "Product Requirements Document",
      "需求分析",
      "功能需求",
      "用户画像",
      "业务流程",
      "技术架构"
    ];

    const hasStructure = content.includes("#") || content.includes("##") || content.includes("###");
    const hasPrdContent = prdIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
    const isLongContent = content.length > 1000; // 内容足够长

    return hasStructure && (hasPrdContent || isLongContent);
  };

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
      
      // 记录复制统计（只有AI消息且有messageId时）
      if (type === "ai" && messageId) {
        try {
          await api.recordMessageCopy(messageId);
          console.log(`📋 记录复制事件: ${messageId}`);
        } catch (error) {
          console.error('记录复制统计失败:', error);
        }
      }
      
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 1500);
    } catch (e) {
      console.error("Failed to copy code block: ", e);
    }
  };

  const copyWholeMessage = async () => {
    try {
      // 对于用户与AI，均复制原始 content。AI 的 content 即 Dify 的 "answer" 原文
      await navigator.clipboard.writeText(content || "");
      setMessageCopied(true);
      
      // 记录复制统计（只有AI消息且有messageId时）
      if (type === "ai" && messageId) {
        try {
          await api.recordMessageCopy(messageId);
          console.log(`📋 记录整个消息复制事件: ${messageId}`);
        } catch (error) {
          console.error('记录复制统计失败:', error);
        }
      }
      
      setTimeout(() => setMessageCopied(false), 1500);
    } catch (e) {
      console.error("Failed to copy message: ", e);
    }
  };

  // 控制用户气泡复制按钮显示/隐藏（延迟消失）
  const showCopy = () => {
    if (hideCopyTimerRef.current) {
      window.clearTimeout(hideCopyTimerRef.current);
      hideCopyTimerRef.current = null;
    }
    setShowCopyBtn(true);
  };

  const hideCopyWithDelay = () => {
    if (hideCopyTimerRef.current) window.clearTimeout(hideCopyTimerRef.current);
    hideCopyTimerRef.current = window.setTimeout(() => {
      setShowCopyBtn(false);
    }, 1000);
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
      <div className={cn("flex flex-col", type === "user" ? "items-end" : "items-start")}>
        <div
          onMouseEnter={type === "user" ? showCopy : undefined}
          onMouseLeave={type === "user" ? hideCopyWithDelay : undefined}
          className={cn(
            // 气泡容器：用户略宽一些
            "rounded-lg p-4 shadow-sm",
            type === "user"
              ? "max-w-[100%] bg-ai-message text-foreground ml-auto"
              : "max-w-[100%] bg-transparent border border-border text-foreground"
          )}
        >
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

        {/* Copy button below bubble */}
        <div
          onMouseEnter={type === "user" ? showCopy : undefined}
          onMouseLeave={type === "user" ? hideCopyWithDelay : undefined}
          className={cn(
            "mt-2 transition-opacity flex items-center gap-2",
            type === "user"
              ? showCopyBtn
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
              : "opacity-100"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 rounded-full border bg-background/60 hover:bg-background text-muted-foreground"
            )}
            onClick={copyWholeMessage}
          >
            {messageCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>

          {/* 在画布中编辑按钮 - 只在AI消息且内容是完整PRD时显示 */}
          {shouldShowEditInCanvas() && onEditInCanvas && (
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 rounded-full bg-black hover:bg-gray-800 text-white text-xs"
              onClick={() => onEditInCanvas(cleanedContent)}
            >
              <Edit className="h-3 w-3 mr-1" />
              {t.chat.editInCanvas}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}