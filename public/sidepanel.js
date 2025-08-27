/*
  PRD For AI Side Panel 逻辑：
  - 读取输入，调用后端 /api/chat（兼容 Dify 工作流代理）
  - 自动获取当前页面信息并整合到PRD生成中
  - 支持流式响应和一键复制
*/

(function () {
  const ideaInput = document.getElementById('ideaInput');
  const generateBtn = document.getElementById('generateBtn');
  const loadingEl = document.getElementById('loading');
  const outputEl = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  
  // 页面数据相关元素
  const pageInfoEl = document.getElementById('pageInfo');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const includePageDataCheckbox = document.getElementById('includePageData');
  const togglePageDataBtn = document.getElementById('togglePageDataBtn');
  const pageDataDetails = document.getElementById('pageDataDetails');
  const htmlPreview = document.getElementById('htmlPreview');
  const textPreview = document.getElementById('textPreview');
  const cssPreview = document.getElementById('cssPreview');
  const copyHtmlBtn = document.getElementById('copyHtmlBtn');
  const copyTextBtn = document.getElementById('copyTextBtn');
  const copyCssBtn = document.getElementById('copyCssBtn');
  const copyFontsBtn = document.getElementById('copyFontsBtn');
  const fontsPreview = document.getElementById('fontsPreview');
  
  // 会话管理
  let dbConversationId = null; // 本地数据库会话ID（由后端返回）
  let difyConversationId = null; // Dify 会话ID（由后端返回）
  
  // 页面数据存储
  let currentPageData = null;
  
  // 流式渲染控制（避免抖动）
  let hasHtml = false; // 一旦收到 HTML（partial/full），改为仅用 HTML 通道渲染
  let pendingHtml = '';
  let lastHtmlFlush = 0;
  const HTML_UPDATE_INTERVAL = 120; // ms，节流

  // API配置
  const API_BASE_URL = (typeof window !== 'undefined' && window.__VITE_API_BASE_URL__) || 'http://localhost:8001';

  // 工具函数
  function setLoading(loading) {
    loadingEl.style.display = loading ? 'block' : 'none';
    generateBtn.disabled = loading;
  }

  // 获取当前页面数据
  async function getCurrentPageData() {
    try {
      console.log('[PRD For AI] Getting current page data...');
      
      // 检查Chrome扩展API是否可用
      if (!chrome || !chrome.runtime) {
        console.error('[PRD For AI] Chrome extension API not available');
        updatePageInfo(null, 'Chrome extension API not available');
        return null;
      }
      
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000); // 10秒超时
        
        chrome.runtime.sendMessage({ 
          action: 'getCurrentPageData' 
        }, (response) => {
          clearTimeout(timeout);
          
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          resolve(response);
        });
      });
      
      if (response && response.success) {
        currentPageData = response.data;
        updatePageInfo(currentPageData);
        console.log('[PRD For AI] Page data updated:', currentPageData);
        return currentPageData;
      } else {
        console.error('[PRD For AI] Failed to get page data:', response?.error);
        updatePageInfo(null, response?.error || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error('[PRD For AI] Error getting page data:', error);
      updatePageInfo(null, error.message);
      return null;
    }
  }

  // 更新页面信息显示
  function updatePageInfo(pageData, error) {
    if (!pageInfoEl) return;
    
    if (error) {
      pageInfoEl.innerHTML = `
        <div class="page-info-error">
          <span class="error-icon">⚠️</span>
          <span>无法获取页面信息: ${error}</span>
        </div>
      `;
      togglePageDataBtn.style.display = 'none';
      return;
    }
    
    if (!pageData) {
      pageInfoEl.innerHTML = `
        <div class="page-info-empty">
          <span>未检测到页面信息</span>
        </div>
      `;
      togglePageDataBtn.style.display = 'none';
      return;
    }
    
    const domain = pageData.domain || '未知域名';
    const title = pageData.title || '未知标题';
    const url = pageData.url || '';
    
    pageInfoEl.innerHTML = `
      <div class="page-info-content">
        <div class="page-info-header">
          <span class="page-icon">🌐</span>
          <div class="page-details">
            <div class="page-title" title="${title}">${truncateText(title, 30)}</div>
            <div class="page-domain">${domain}</div>
          </div>
          <div class="page-status ${pageData.error ? 'error' : 'success'}">
            ${pageData.error ? '❌' : '✅'}
          </div>
        </div>
        ${pageData.textContent ? `
          <div class="page-stats">
            <span>📝 ${pageData.textContent.paragraphs?.length || 0} 段落</span>
            <span>🔗 ${pageData.textContent.links?.length || 0} 链接</span>
            <span>🎨 ${pageData.styles?.externalStylesheets?.length || 0} 样式表</span>
            <span>🔤 ${pageData.fonts?.summary?.totalFontResources || 0} 字体文件</span>
          </div>
        ` : ''}
      </div>
    `;
    
    // 如果有详细的页面数据，显示查看按钮
    if (pageData.htmlSource || pageData.textContent || pageData.styles || pageData.fonts) {
      togglePageDataBtn.style.display = 'block';
      updatePageDataDetails(pageData);
    } else {
      togglePageDataBtn.style.display = 'none';
    }
  }

  // 更新页面数据详情显示
  function updatePageDataDetails(pageData) {
    if (!pageData) return;
    
    // 更新HTML源码预览
    if (pageData.htmlSource && htmlPreview) {
      const truncatedHtml = pageData.htmlSource.length > 5000 
        ? pageData.htmlSource.substring(0, 5000) + '\n\n... (显示前5000字符，完整内容可复制)'
        : pageData.htmlSource;
      htmlPreview.textContent = truncatedHtml;
    }
    
    // 更新页面文本预览
    if (pageData.textContent && textPreview) {
      let textSummary = '';
      if (pageData.textContent.headings) {
        textSummary += '=== 页面标题 ===\n';
        pageData.textContent.headings.forEach(h => {
          textSummary += `${h.tag.toUpperCase()}: ${h.text}\n`;
        });
        textSummary += '\n';
      }
      if (pageData.textContent.paragraphs) {
        textSummary += '=== 页面段落 ===\n';
        pageData.textContent.paragraphs.slice(0, 10).forEach((p, i) => {
          textSummary += `${i+1}. ${p.substring(0, 200)}${p.length > 200 ? '...' : ''}\n`;
        });
        if (pageData.textContent.paragraphs.length > 10) {
          textSummary += `\n... 还有 ${pageData.textContent.paragraphs.length - 10} 个段落\n`;
        }
      }
      if (pageData.textContent.links) {
        textSummary += '\n=== 页面链接 ===\n';
        pageData.textContent.links.slice(0, 20).forEach((link, i) => {
          textSummary += `${i+1}. ${link.text} -> ${link.href}\n`;
        });
        if (pageData.textContent.links.length > 20) {
          textSummary += `... 还有 ${pageData.textContent.links.length - 20} 个链接\n`;
        }
      }
      textPreview.textContent = textSummary;
    }
    
    // 更新CSS样式预览
    if (pageData.styles && cssPreview) {
      let cssSummary = '';
      if (pageData.styles.externalStylesheets?.length > 0) {
        cssSummary += '=== 外部样式表 ===\n';
        pageData.styles.externalStylesheets.forEach((sheet, i) => {
          cssSummary += `${i+1}. ${sheet.href || sheet.title || '未知样式表'}\n`;
        });
        cssSummary += '\n';
      }
      if (pageData.styles.cssVariables && Object.keys(pageData.styles.cssVariables).length > 0) {
        cssSummary += '=== CSS变量 ===\n';
        Object.entries(pageData.styles.cssVariables).forEach(([key, value]) => {
          cssSummary += `${key}: ${value}\n`;
        });
        cssSummary += '\n';
      }
      if (pageData.styles.computedStyles) {
        cssSummary += '=== 计算样式 (主要元素) ===\n';
        Object.entries(pageData.styles.computedStyles).forEach(([element, styles]) => {
          cssSummary += `${element.toUpperCase()}:\n`;
          Object.entries(styles).forEach(([prop, value]) => {
            cssSummary += `  ${prop}: ${value}\n`;
          });
          cssSummary += '\n';
        });
      }
      cssPreview.textContent = cssSummary;
    }
    
    // 更新字体信息预览
    if (pageData.fonts && fontsPreview) {
      let fontsSummary = '';
      
      // 字体使用总结
      if (pageData.fonts.summary) {
        fontsSummary += '=== 字体使用统计 ===\n';
        fontsSummary += `总计使用字体: ${pageData.fonts.summary.totalUsedFonts} 种\n`;
        fontsSummary += `Web字体声明: ${pageData.fonts.summary.totalWebFonts} 个\n`;
        fontsSummary += `字体文件加载: ${pageData.fonts.summary.totalFontResources} 个\n`;
        if (pageData.fonts.summary.totalFontSize > 0) {
          fontsSummary += `总字体大小: ${formatFileSize(pageData.fonts.summary.totalFontSize)}\n`;
        }
        if (pageData.fonts.summary.fontFormats?.length > 0) {
          fontsSummary += `字体格式: ${pageData.fonts.summary.fontFormats.join(', ')}\n`;
        }
        if (pageData.fonts.summary.fontDomains?.length > 0) {
          fontsSummary += `字体来源: ${pageData.fonts.summary.fontDomains.join(', ')}\n`;
        }
        fontsSummary += '\n';
      }
      
      // 字体文件详情
      if (pageData.fonts.fontResources?.length > 0) {
        fontsSummary += '=== 字体文件详情 ===\n';
        pageData.fonts.fontResources.forEach((font, i) => {
          fontsSummary += `${i+1}. ${font.name}\n`;
          fontsSummary += `   URL: ${font.url}\n`;
          fontsSummary += `   域名: ${font.domain}\n`;
          fontsSummary += `   格式: ${font.format}\n`;
          fontsSummary += `   大小: ${formatFileSize(font.size)}\n`;
          fontsSummary += `   状态: ${font.status}\n`;
          if (font.loadTime > 0) {
            fontsSummary += `   加载时间: ${font.loadTime.toFixed(2)}ms\n`;
          }
          fontsSummary += '\n';
        });
      }
      
      // 字体族使用
      if (pageData.fonts.used?.length > 0) {
        fontsSummary += '=== 页面使用的字体族 ===\n';
        pageData.fonts.used.forEach((font, i) => {
          fontsSummary += `${i+1}. ${font}\n`;
        });
        fontsSummary += '\n';
      }
      
      // @font-face声明
      if (pageData.fonts.webFonts?.length > 0) {
        const fontFaceDeclarations = pageData.fonts.webFonts.filter(f => f.cssText || f.src);
        if (fontFaceDeclarations.length > 0) {
          fontsSummary += '=== @font-face声明 ===\n';
          fontFaceDeclarations.slice(0, 5).forEach((font, i) => {
            if (font.family) {
              fontsSummary += `${i+1}. ${font.family}\n`;
              if (font.weight) fontsSummary += `   字重: ${font.weight}\n`;
              if (font.style) fontsSummary += `   样式: ${font.style}\n`;
              if (font.display) fontsSummary += `   显示: ${font.display}\n`;
              if (font.sources?.length > 0) {
                fontsSummary += `   来源:\n`;
                font.sources.forEach(src => {
                  fontsSummary += `     - ${src.format}: ${src.url}\n`;
                });
              }
              fontsSummary += '\n';
            }
          });
          if (fontFaceDeclarations.length > 5) {
            fontsSummary += `... 还有 ${fontFaceDeclarations.length - 5} 个@font-face声明\n`;
          }
        }
      }
      
      fontsPreview.textContent = fontsSummary;
    }
  }

  // 切换页面数据显示
  function togglePageData() {
    if (pageDataDetails.style.display === 'none') {
      pageDataDetails.style.display = 'block';
      togglePageDataBtn.textContent = '🔼 隐藏页面数据';
    } else {
      pageDataDetails.style.display = 'none';
      togglePageDataBtn.textContent = '📋 查看页面数据';
    }
  }

  // 复制功能
  async function copyToClipboard(text, buttonEl, originalText) {
    try {
      await navigator.clipboard.writeText(text);
      buttonEl.textContent = '已复制!';
      setTimeout(() => {
        buttonEl.textContent = originalText;
      }, 1500);
    } catch (error) {
      console.error('复制失败:', error);
      buttonEl.textContent = '复制失败';
      setTimeout(() => {
        buttonEl.textContent = originalText;
      }, 1500);
    }
  }
  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 生成包含页面数据的上下文提示
  function generatePageContext(pageData, userIdea) {
    if (!pageData || !includePageDataCheckbox?.checked) {
      return userIdea;
    }
    
    let context = `基于当前网页信息，${userIdea}\n\n`;
    context += `【当前网页信息】\n`;
    context += `网站: ${pageData.title} (${pageData.domain})\n`;
    context += `网址: ${pageData.url}\n`;
    
    if (pageData.textContent) {
      context += `\n【页面内容概览】\n`;
      if (pageData.textContent.headings?.length > 0) {
        context += `主要标题: ${pageData.textContent.headings.slice(0, 3).map(h => h.text).join(', ')}\n`;
      }
      if (pageData.textContent.paragraphs?.length > 0) {
        const sampleText = pageData.textContent.paragraphs.slice(0, 2).join(' ').substring(0, 200);
        context += `内容摘要: ${sampleText}...\n`;
      }
    }
    
    if (pageData.styles) {
      context += `\n【技术信息】\n`;
      if (pageData.styles.externalStylesheets?.length > 0) {
        context += `使用了 ${pageData.styles.externalStylesheets.length} 个外部样式表\n`;
      }
      if (pageData.fonts?.used?.length > 0) {
        context += `主要字体: ${pageData.fonts.used.slice(0, 3).join(', ')}\n`;
      }
      if (pageData.fonts?.summary?.totalFontResources > 0) {
        context += `加载了 ${pageData.fonts.summary.totalFontResources} 个字体文件`;
        if (pageData.fonts.summary.totalFontSize > 0) {
          context += ` (${formatFileSize(pageData.fonts.summary.totalFontSize)})`;
        }
        context += '\n';
      }
      if (pageData.fonts?.summary?.fontFormats?.length > 0) {
        context += `字体格式: ${pageData.fonts.summary.fontFormats.join(', ')}\n`;
      }
    }
    
    context += `\n【用户需求】\n${userIdea}`;
    
    return context;
  }

  // 新对话：清空会话ID与展示
  newChatBtn?.addEventListener('click', () => {
    dbConversationId = null;
    difyConversationId = null;
    outputEl.innerHTML = '';
    ideaInput.focus();
  });

  // 刷新页面数据
  refreshPageBtn?.addEventListener('click', async () => {
    refreshPageBtn.disabled = true;
    refreshPageBtn.textContent = '刷新中...';
    
    await getCurrentPageData();
    
    refreshPageBtn.disabled = false;
    refreshPageBtn.textContent = '刷新';
  });

  // API请求函数
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

  // Markdown渲染（简单版本）
  function renderMarkdown(text) {
    outputEl.textContent = text == null ? '' : String(text);
  }

  // 主要的生成处理函数
  async function handleGenerate() {
    const idea = (ideaInput.value || '').trim();
    if (!idea) {
      outputEl.textContent = '请先输入你的应用想法。';
      return;
    }
    
    setLoading(true);
    outputEl.textContent = '';
    copyBtn.style.display = 'none';
    hasHtml = false;

    try {
      // 获取当前页面数据（如果用户选择包含）
      let contextualIdea = idea;
      if (includePageDataCheckbox?.checked) {
        if (!currentPageData) {
          await getCurrentPageData();
        }
        contextualIdea = generatePageContext(currentPageData, idea);
      }
      
      // 构建请求体
      const history = [];
      const body = {
        messages: [...history, { role: 'user', content: contextualIdea }],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
        output_format: 'text',
        conversation_id: dbConversationId,
        dify_conversation_id: difyConversationId,
        // 如果包含页面数据，添加到请求中
        ...(includePageDataCheckbox?.checked && currentPageData ? {
          page_data: {
            url: currentPageData.url,
            title: currentPageData.title,
            domain: currentPageData.domain,
            text_summary: currentPageData.textContent?.paragraphs?.slice(0, 3).join(' ').substring(0, 500),
            headings: currentPageData.textContent?.headings?.slice(0, 5),
            tech_info: {
              fonts: currentPageData.fonts?.used?.slice(0, 5),
              stylesheets: currentPageData.styles?.externalStylesheets?.length || 0,
              font_resources: currentPageData.fonts?.summary?.totalFontResources || 0,
              font_formats: currentPageData.fonts?.summary?.fontFormats || [],
              font_size: currentPageData.fonts?.summary?.totalFontSize || 0
            }
          }
        } : {})
      };

      // 发送流式请求
      let acc = '';
      outputEl.textContent = '';

      const resp = await fetch(`${API_BASE_URL}/api/chat`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      
      // 清空输入框
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
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          
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
            } catch (parseError) {
              // 忽略解析错误
              console.log('[PRD For AI] Parse error:', parseError);
            }
          }
        }
      }

      // 收尾：如已进入 HTML 模式，确保最后一次刷新；否则保留纯文本
      if (hasHtml) {
        if (pendingHtml) outputEl.innerHTML = pendingHtml;
      } else if (acc) {
        renderMarkdown(acc);
      }
      
      if (acc || hasHtml) {
        copyBtn.style.display = 'inline-flex';
      }
      
    } catch (e) {
      outputEl.textContent = `生成失败：${e?.message || e}`;
    } finally {
      setLoading(false);
    }
  }

  // 复制功能
  async function handleCopy() {
    try {
      // 优先复制 Dify 原始 answer 文本（acc 累积的原文）
      const raw = outputEl.getAttribute('data-raw-answer');
      const text = raw != null ? raw : (outputEl.textContent || '');
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '已复制';
      setTimeout(() => (copyBtn.textContent = '一键复制'), 1200);
    } catch (error) {
      console.error('[PRD For AI] Copy failed:', error);
    }
  }

  // 事件监听器
  generateBtn.addEventListener('click', handleGenerate);
  copyBtn.addEventListener('click', handleCopy);
  
  // 页面数据相关事件
  togglePageDataBtn?.addEventListener('click', togglePageData);
  
  copyHtmlBtn?.addEventListener('click', () => {
    if (currentPageData?.htmlSource) {
      copyToClipboard(currentPageData.htmlSource, copyHtmlBtn, '复制');
    }
  });
  
  copyTextBtn?.addEventListener('click', () => {
    if (currentPageData?.textContent) {
      let fullText = '';
      if (currentPageData.textContent.headings) {
        fullText += '=== 页面标题 ===\n';
        currentPageData.textContent.headings.forEach(h => {
          fullText += `${h.tag.toUpperCase()}: ${h.text}\n`;
        });
        fullText += '\n';
      }
      if (currentPageData.textContent.fullText) {
        fullText += '=== 完整文本 ===\n';
        fullText += currentPageData.textContent.fullText;
      } else if (currentPageData.textContent.paragraphs) {
        fullText += '=== 页面段落 ===\n';
        currentPageData.textContent.paragraphs.forEach((p, i) => {
          fullText += `${i+1}. ${p}\n`;
        });
      }
      copyToClipboard(fullText, copyTextBtn, '复制');
    }
  });
  
  copyCssBtn?.addEventListener('click', () => {
    if (currentPageData?.styles) {
      let fullCss = '';
      
      if (currentPageData.styles.inlineStyles?.length > 0) {
        fullCss += '=== 内联样式 ===\n';
        currentPageData.styles.inlineStyles.forEach((style, i) => {
          if (typeof style === 'string') {
            fullCss += `${i+1}. ${style}\n`;
          } else {
            fullCss += `${i+1}. ${style.element}: ${style.style}\n`;
          }
        });
        fullCss += '\n';
      }
      
      if (currentPageData.styles.externalStylesheets?.length > 0) {
        fullCss += '=== 外部样式表 ===\n';
        currentPageData.styles.externalStylesheets.forEach((sheet, i) => {
          fullCss += `${i+1}. ${sheet.href || sheet.title || '未知样式表'}\n`;
          if (sheet.rules) {
            fullCss += sheet.rules.join('\n') + '\n';
          }
        });
        fullCss += '\n';
      }
      
      if (currentPageData.styles.cssVariables && Object.keys(currentPageData.styles.cssVariables).length > 0) {
        fullCss += '=== CSS变量 ===\n';
        Object.entries(currentPageData.styles.cssVariables).forEach(([key, value]) => {
          fullCss += `${key}: ${value}\n`;
        });
        fullCss += '\n';
      }
      
      copyToClipboard(fullCss, copyCssBtn, '复制');
    }
  });
  
  copyFontsBtn?.addEventListener('click', () => {
    if (currentPageData?.fonts) {
      let fullFonts = '';
      
      // 字体使用统计
      if (currentPageData.fonts.summary) {
        fullFonts += '=== 字体使用统计 ===\n';
        fullFonts += `总计使用字体: ${currentPageData.fonts.summary.totalUsedFonts} 种\n`;
        fullFonts += `Web字体声明: ${currentPageData.fonts.summary.totalWebFonts} 个\n`;
        fullFonts += `字体文件加载: ${currentPageData.fonts.summary.totalFontResources} 个\n`;
        if (currentPageData.fonts.summary.totalFontSize > 0) {
          fullFonts += `总字体大小: ${formatFileSize(currentPageData.fonts.summary.totalFontSize)}\n`;
        }
        if (currentPageData.fonts.summary.fontFormats?.length > 0) {
          fullFonts += `字体格式: ${currentPageData.fonts.summary.fontFormats.join(', ')}\n`;
        }
        if (currentPageData.fonts.summary.fontDomains?.length > 0) {
          fullFonts += `字体来源: ${currentPageData.fonts.summary.fontDomains.join(', ')}\n`;
        }
        fullFonts += '\n';
      }
      
      // 字体文件详情
      if (currentPageData.fonts.fontResources?.length > 0) {
        fullFonts += '=== 字体文件详情 ===\n';
        currentPageData.fonts.fontResources.forEach((font, i) => {
          fullFonts += `${i+1}. ${font.name}\n`;
          fullFonts += `   URL: ${font.url}\n`;
          fullFonts += `   域名: ${font.domain}\n`;
          fullFonts += `   格式: ${font.format}\n`;
          fullFonts += `   大小: ${formatFileSize(font.size)}\n`;
          fullFonts += `   状态: ${font.status}\n`;
          if (font.loadTime > 0) {
            fullFonts += `   加载时间: ${font.loadTime.toFixed(2)}ms\n`;
          }
          fullFonts += '\n';
        });
      }
      
      // 字体族使用
      if (currentPageData.fonts.used?.length > 0) {
        fullFonts += '=== 页面使用的字体族 ===\n';
        currentPageData.fonts.used.forEach((font, i) => {
          fullFonts += `${i+1}. ${font}\n`;
        });
        fullFonts += '\n';
      }
      
      // @font-face声明
      if (currentPageData.fonts.webFonts?.length > 0) {
        const fontFaceDeclarations = currentPageData.fonts.webFonts.filter(f => f.cssText || f.src);
        if (fontFaceDeclarations.length > 0) {
          fullFonts += '=== @font-face声明 ===\n';
          fontFaceDeclarations.forEach((font, i) => {
            if (font.family || font.cssText) {
              fullFonts += `${i+1}. ${font.family || '字体声明'}\n`;
              if (font.weight) fullFonts += `   字重: ${font.weight}\n`;
              if (font.style) fullFonts += `   样式: ${font.style}\n`;
              if (font.display) fullFonts += `   显示: ${font.display}\n`;
              if (font.sources?.length > 0) {
                fullFonts += `   来源:\n`;
                font.sources.forEach(src => {
                  fullFonts += `     - ${src.format}: ${src.url}\n`;
                });
              } else if (font.src) {
                fullFonts += `   来源: ${font.src}\n`;
              }
              if (font.cssText) {
                fullFonts += `   CSS: ${font.cssText}\n`;
              }
              fullFonts += '\n';
            }
          });
        }
      }
      
      copyToClipboard(fullFonts, copyFontsBtn, '复制');
    }
  });
  
  // Enter 发送，Shift+Enter 换行
  ideaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  });

  // 监听标签页变化
  async function handleTabChange() {
    console.log('[PRD For AI] Tab changed, refreshing page data...');
    
    // 显示刷新状态
    if (refreshPageBtn) {
      refreshPageBtn.disabled = true;
      refreshPageBtn.textContent = '正在同步...';
    }
    
    // 清除旧数据
    currentPageData = null;
    updatePageInfo(null, '正在获取当前页面信息...');
    
    // 重新获取当前页面数据
    await getCurrentPageData();
    
    // 恢复按钮状态
    if (refreshPageBtn) {
      refreshPageBtn.disabled = false;
      refreshPageBtn.textContent = '刷新';
    }
  }

  // 页面加载完成时初始化
  async function initializeSidepanel() {
    console.log('[PRD For AI] Sidepanel initializing...');
    
    // 监听标签页激活事件
    if (chrome.tabs && chrome.tabs.onActivated) {
      chrome.tabs.onActivated.addListener(handleTabChange);
    }
    
    // 监听标签页更新事件
    if (chrome.tabs && chrome.tabs.onUpdated) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
        // 只在页面加载完成时更新
        if (changeInfo.status === 'complete') {
          // 检查是否为当前活动标签
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id === tabId) {
              handleTabChange();
            }
          });
        }
      });
    }
    
    // 延迟一下再获取页面数据，确保Chrome API准备就绪
    setTimeout(async () => {
      console.log('[PRD For AI] Starting to get page data...');
      await getCurrentPageData();
    }, 1000);
  }

  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSidepanel);
  } else {
    initializeSidepanel();
  }
})();