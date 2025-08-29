import { useState } from "react";
import { MessageSquare, Trash2, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={cn(
        // 使侧边栏成为纵向flex容器，并允许子项使用flex-1撑满剩余空间
        // min-h-0 防止flex子项计算高度时溢出，确保内部滚动生效
        "relative h-full min-h-0 flex flex-col bg-aurora border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed ? (
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
            title="返回官网"
          >
            <img src="/logo-prd-for-ai.svg" alt="PRD For AI" className="h-8 w-8" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="mx-auto"
            title="展开侧边栏"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      {/* New Conversation Button */}
      <div className="p-4">
        <Button
          onClick={onNewConversation}
          className="w-full btn-gradient-soft text-primary-foreground transition-all rounded-2xl h-11"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">新建对话</span>}
        </Button>
      </div>

      {/* Conversations List */}
      {/* 列表区域：占据剩余高度并允许内部滚动 */}
      <ScrollArea className="flex-1 min-h-0 px-2">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group relative rounded-lg p-3 cursor-pointer transition-all",
                "hover:bg-background/60",
                activeConversationId === conversation.id && "bg-background shadow-sm border border-border"
              )}
              onClick={() => onSelectConversation(conversation.id)}
              onMouseEnter={() => setHoveredId(conversation.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {conversation.preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTime(conversation.timestamp)}
                    </p>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              {!isCollapsed && hoveredId === conversation.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Logo at bottom for collapsed state */}
      {isCollapsed && (
        <div className="p-2 pb-4">
          <Link 
            to="/" 
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            title="返回官网"
          >
            <img src="/logo-prd-for-ai.svg" alt="PRD For AI" className="h-6 w-6" />
          </Link>
        </div>
      )}
    </div>
  );
}