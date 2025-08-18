import { useState, useRef, useCallback } from "react";
import { Send, Mic, MicOff, Plus, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  onStopResponse?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onStopResponse,
  disabled = false,
  isGenerating = false,
  placeholder = "说出您的需求"
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const MAX_CHARS = 5000;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'xls', 'pptx', 'ppt'];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!message.trim() && files.length === 0) || disabled || isGenerating) return;

    onSendMessage(message.trim(), files);
    setMessage("");
    setFiles([]);
    setCharCount(0);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleStop = () => {
    if (onStopResponse) {
      onStopResponse();
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "文件过大",
        description: `文件 "${file.name}" 超过 50MB 限制`,
        variant: "destructive",
      });
      return false;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      toast({
        title: "文件格式不支持",
        description: `不支持 .${extension} 格式文件`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    Array.from(selectedFiles).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
        setFiles(prev => [...prev, audioFile]);
        setMessage("语音输入的内容会在这里显示...");

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "开始录音",
        description: "正在录制语音消息...",
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: "无法访问麦克风，请检查权限设置",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      toast({
        title: "录音完成",
        description: "语音消息已准备发送",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-transparent p-4 pb-6">
      {/* File Upload Area - only show after selecting files */}
      {files.length > 0 && (
        <div
          className={cn(
            "relative border rounded-lg p-4 mb-4 transition-colors bg-secondary/30",
            dragActive ? "ring-2 ring-primary/40" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">已选择文件:</p>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-background p-2 rounded border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - pill style bar (minimal, themed) */}
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "relative flex items-end gap-1 rounded-[28px] bg-card/80 px-2 py-2 md:px-3 md:py-2 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/60 ai-input-border",
            dragActive ? "ring-2 ring-primary/40" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Left: add/attach */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="添加附件"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-8 w-8 rounded-full self-end"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[56px] max-h-32 resize-none bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 md:px-0 pr-16 pt-2 pb-2 text-[15px] leading-6 text-left placeholder:text-foreground/60"
              style={{ height: 'auto' }}
            />

          </div>

          {/* Right: show mic when empty, send when has content, stop when generating */}
          <div className="flex items-end gap-1 md:gap-2">
            {isGenerating ? (
              <Button
                onClick={handleStop}
                disabled={disabled}
                size="icon"
                aria-label="停止响应"
                className="h-8 w-8 rounded-full p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground self-end"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : message.trim().length === 0 && files.length === 0 ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={isRecording ? "停止录音" : "开始录音"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={cn(
                  "h-8 w-8 rounded-full self-end",
                  isRecording && "bg-destructive text-destructive-foreground"
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={disabled || isGenerating}
                size="icon"
                aria-label="发送"
                className="h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary-light text-primary-foreground self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}