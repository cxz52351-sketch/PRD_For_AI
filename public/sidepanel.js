/*
  Side Panel 逻辑：
  - 读取输入，调用后端 /api/chat（兼容 Dify 工作流代理）
  - 支持流式/阻塞均可；这里先用阻塞模式，简单稳定
  - 生成结果展示与一键复制
*/

(function () {
  const ideaInput = document.getElementById('ideaInput');
  const generateBtn = document.getElementById('generateBtn');
  const loadingEl = document.getElementById('loading');
  const outputEl = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  // 取消会话列表：仅维护一次性对话所需的会话ID（保存在内存）
  let dbConversationId = null; // 本地数据库会话ID（由后端返回）
  let difyConversationId = null; // Dify 会话ID（由后端返回）
  // 流式渲染控制（避免抖动）
  let hasHtml = false; // 一旦收到 HTML（partial/full），改为仅用 HTML 通道渲染
  let pendingHtml = '';
  let lastHtmlFlush = 0;
  const HTML_UPDATE_INTERVAL = 120; // ms，节流

  // 与前端同源使用的后端地址（优先读打包注入的环境变量，不存在则回退默认）
  const API_BASE_URL = (typeof window !== 'undefined' && window.__VITE_API_BASE_URL__) || 'http://localhost:8001';

  function setLoading(loading) {
    loadingEl.style.display = loading ? 'block' : 'none';
    generateBtn.disabled = loading;
  }

  // 新对话：清空会话ID与展示
  newChatBtn?.addEventListener('click', () => {
    dbConversationId = null;
    difyConversationId = null;
    outputEl.innerHTML = '';
    ideaInput.focus();
  });

  async function postJSON(endpoint, body) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  // 完全不解析，原样渲染：仅把 Dify 返回的 Markdown 文本直接交给浏览器显示
  function renderMarkdown(text) {
    outputEl.textContent = text == null ? '' : String(text);
  }

  async function handleGenerate() {
    const idea = (ideaInput.value || '').trim();
    if (!idea) {
      outputEl.textContent = '请先输入你的应用想法。';
      return;
    }
    setLoading(true);
    outputEl.textContent = '';
    copyBtn.style.display = 'none';

    try {
      // 侧边栏采用流式：后端已兼容 SSE，前端这里解析
      // 简化为一次性对话：仅依赖会话ID维持上下文
      const history = [];
      const body = {
        messages: [...history, { role: 'user', content: idea }],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
        output_format: 'text',
        conversation_id: dbConversationId,
        dify_conversation_id: difyConversationId,
      };

      // 清空展示并准备接收增量
      let acc = '';
      outputEl.textContent = '';

      const resp = await fetch(`${API_BASE_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      // 按你的需求：发送后立即清空输入框（保留在历史由模型追问引导）
      ideaInput.value = '';
      if (!resp.ok || !resp.body) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buf += chunk;
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (!line.trim()) continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const json = JSON.parse(data);
              if (json.choices && json.choices[0]?.delta?.content) {
                const delta = json.choices[0].delta.content;
                acc += delta;
                // 仅在未切换到 HTML 模式前展示纯文本，避免覆盖 HTML
                if (!hasHtml) {
                  renderMarkdown(acc);
                }
                // 同步维护原始文本，供一键复制
                outputEl.setAttribute('data-raw-answer', acc);
                // 自动滚动到底部
                outputEl.scrollTop = outputEl.scrollHeight;
              } else if (json.type === 'html_partial' && json.html) {
                // 流式增量 HTML，边流边渲染（节流避免抖动）
                hasHtml = true;
                pendingHtml = json.html;
                const now = Date.now();
                if (now - lastHtmlFlush > HTML_UPDATE_INTERVAL) {
                  outputEl.innerHTML = pendingHtml;
                  lastHtmlFlush = now;
                }
              } else if (json.type === 'html' && json.html) {
                // 服务端已渲染 HTML（忠实渲染），优先展示
                hasHtml = true;
                outputEl.innerHTML = json.html;
                lastHtmlFlush = Date.now();
              } else if (json.type === 'conversation') {
                // 记录后端返回的会话ID便于续聊（仅内存保存）
                dbConversationId = json.conversation_id || dbConversationId;
                difyConversationId = json.dify_conversation_id || difyConversationId;
              }
            } catch {}
          }
        }
      }

      // 收尾：如已进入 HTML 模式，确保最后一次刷新；否则保留纯文本
      if (hasHtml) {
        if (pendingHtml) outputEl.innerHTML = pendingHtml;
        copyBtn.style.display = 'inline-flex';
      } else if (acc) {
        renderMarkdown(acc);
        copyBtn.style.display = 'inline-flex';
      }
    } catch (e) {
      outputEl.textContent = `生成失败：${e?.message || e}`;
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      // 优先复制 Dify 原始 answer 文本（acc 累积的原文）
      const raw = outputEl.getAttribute('data-raw-answer');
      const text = raw != null ? raw : (outputEl.textContent || '');
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '已复制';
      setTimeout(() => (copyBtn.textContent = '一键复制'), 1200);
    } catch {}
  }

  generateBtn.addEventListener('click', handleGenerate);
  // Enter 发送，Shift+Enter 换行
  ideaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  });
  copyBtn.addEventListener('click', handleCopy);
})();


