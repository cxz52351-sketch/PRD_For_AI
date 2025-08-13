import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
  className?: string;
}

export default function Mermaid({ chart, className }: MermaidProps) {
  const rawId = useId().replace(/:/g, "_");
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          // 关闭全局错误横幅渲染，仅在组件内部做轻量提示
          suppressErrorRenderer: true,
          logLevel: 5,
        });
        const { svg } = await mermaid.render(`mermaid-${rawId}`, chart);
        if (mounted) setSvg(svg);
      } catch (e) {
        const esc = (s: string) => s.replace(/[<>&]/g, m => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m] as string));
        const msg = e instanceof Error ? e.message : "Mermaid 渲染失败";
        setSvg(`
          <div style="font-size:12px;color:#b42318;background:#fff4f2;border:1px solid #fecdcf;padding:8px;border-radius:8px;">
            <strong style="display:block;margin-bottom:4px;">Mermaid 语法错误</strong>
            <div style="opacity:.85;margin-bottom:6px;">${esc(msg)}</div>
            <pre style="margin:0;white-space:pre-wrap;color:#6b7280;background:transparent;">${esc(chart)}</pre>
          </div>
        `);
      }
    })();
    return () => { mounted = false; };
  }, [chart, rawId]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}


