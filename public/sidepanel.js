/*
  AI 编程助手 Side Panel 逻辑：
  整合三大功能：智能Prompt生成、页面数据提取、PRD生成
*/

(function () {
  // ===========================================
  // DOM 元素引用
  // ===========================================

  // 选项卡相关
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // 功能1：智能Prompt生成
  const selectElementBtn = document.getElementById('selectElementBtn');
  const exitSelectionBtn = document.getElementById('exitSelectionBtn');
  const currentPageInfo = document.getElementById('currentPageInfo');
  const promptOutput = document.getElementById('promptOutput');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const clearPromptBtn = document.getElementById('clearPromptBtn');
  // 新增：所选元素详情区
  const selectedElementSection = document.getElementById('selected-element-section');
  const selHtmlPreview = document.getElementById('selHtmlPreview');
  const selTextPreview = document.getElementById('selTextPreview');
  const selCssPreview = document.getElementById('selCssPreview');
  const selFontsPreview = document.getElementById('selFontsPreview');
  const copySelHtmlBtn = document.getElementById('copySelHtmlBtn');
  const copySelTextBtn = document.getElementById('copySelTextBtn');
  const copySelCssBtn = document.getElementById('copySelCssBtn');
  const copySelFontsBtn = document.getElementById('copySelFontsBtn');
  const copySelHtmlBtn2 = document.getElementById('copySelHtmlBtn2');
  const copySelTextBtn2 = document.getElementById('copySelTextBtn2');
  const copySelCssBtn2 = document.getElementById('copySelCssBtn2');
  const copySelFontsBtn2 = document.getElementById('copySelFontsBtn2');

  // 新增元素信息区域
  const selAttrsPreview = document.getElementById('selAttrsPreview');
  const selDimensionsPreview = document.getElementById('selDimensionsPreview');
  const selPathPreview = document.getElementById('selPathPreview');
  const selPageInfoPreview = document.getElementById('selPageInfoPreview');
  const selScreenshotPreview = document.getElementById('selScreenshotPreview');
  const screenshotSection = document.getElementById('screenshotSection');
  const copySelAttrsBtn = document.getElementById('copySelAttrsBtn');
  const copySelDimensionsBtn = document.getElementById('copySelDimensionsBtn');
  const copySelPathBtn = document.getElementById('copySelPathBtn');
  const copySelPageInfoBtn = document.getElementById('copySelPageInfoBtn');
  const copySelScreenshotBtn = document.getElementById('copySelScreenshotBtn');

  // 功能2：页面数据提取
  const pageInfoDisplay = document.getElementById('pageInfoDisplay');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const includePageDataCheckbox = document.getElementById('includePageData');
  const togglePageDataBtn = document.getElementById('togglePageDataBtn');
  const pageDataDetails = document.getElementById('pageDataDetails');
  const htmlPreview = document.getElementById('htmlPreview');
  const textPreview = document.getElementById('textPreview');
  const cssPreview = document.getElementById('cssPreview');
  const fontsPreview = document.getElementById('fontsPreview');
  const copyHtmlBtn = document.getElementById('copyHtmlBtn');
  const copyTextBtn = document.getElementById('copyTextBtn');
  const copyCssBtn = document.getElementById('copyCssBtn');
  const copyFontsBtn = document.getElementById('copyFontsBtn');

  // 功能3：PRD生成
  const ideaInput = document.getElementById('ideaInput');
  const generateBtn = document.getElementById('generateBtn');
  const loadingEl = document.getElementById('loading');
  const outputEl = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');
  const newChatBtn = document.getElementById('newChatBtn');

  // ===========================================
  // 全局状态管理
  // ===========================================

  // 当前激活的选项卡
  let activeTab = 'prompt';

  // 智能Prompt功能状态
  let isSelectionMode = false;
  let currentElementData = null;
  let lastElementTimestamp = 0;

  // 页面数据功能状态
  let currentPageData = null;

  // PRD生成功能状态
  let dbConversationId = null; // 本地数据库会话ID（由后端返回）
  let difyConversationId = null; // Dify 会话ID（由后端返回）

  // 流式渲染控制（避免抖动）
  let hasHtml = false; // 一旦收到 HTML（partial/full），改为仅用 HTML 通道渲染
  let pendingHtml = '';
  let lastHtmlFlush = 0;
  const HTML_UPDATE_INTERVAL = 120; // ms，节流

  // API配置
  const API_BASE_URL = (typeof window !== 'undefined' && window.__VITE_API_BASE_URL__) || 'http://localhost:8001';

  // ===========================================
  // 工具函数
  // ===========================================

  function setLoading(loading) {
    if (loadingEl) loadingEl.style.display = loading ? 'block' : 'none';
    if (generateBtn) generateBtn.disabled = loading;
  }

  // 显示状态消息
  function showStatusMessage(message, type = 'info') {
    // 创建状态消息元素
    const statusEl = document.createElement('div');
    statusEl.className = `status-message ${type}`;
    statusEl.textContent = message;

    // 添加到页面
    document.body.appendChild(statusEl);

    // 自动移除
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.parentNode.removeChild(statusEl);
      }
    }, 3000);
  }

  // 截断文本
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

  // 复制到剪贴板
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

  // Markdown渲染（简单版本）
  function renderMarkdown(text) {
    if (outputEl) {
      outputEl.textContent = text == null ? '' : String(text);
    }
  }

  // ===========================================
  // 选项卡功能
  // ===========================================

  function switchTab(tabName) {
    // 更新按钮状态
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 更新内容显示
    tabContents.forEach(content => {
      if (content.id === tabName + '-tab') {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    activeTab = tabName;

    // 根据切换的选项卡执行特定初始化
    if (tabName === 'prompt') {
      updatePageInfo(); // 更新页面信息
    } else if (tabName === 'page') {
      updatePageInfoDisplay(); // 更新页面数据显示
    }
  }

  // ===========================================
  // 功能1：智能Prompt生成
  // ===========================================

  // 更新页面信息显示（用于Prompt功能）
  async function updatePageInfo() {
    if (!currentPageInfo) return;

    try {
      // 获取当前激活的标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        currentPageInfo.innerHTML = `
          <div class="page-info-error">
            <span class="error-icon">❌</span>
            <span>无法获取当前标签页</span>
          </div>
        `;
        return;
      }

      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000); // 5秒超时

        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getPageInfo'
        }, (response) => {
          clearTimeout(timeout);

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          resolve(response);
        });
      });

      if (response?.success && response.data) {
        const pageData = response.data;
        currentPageInfo.innerHTML = `
          <div class="page-info-content">
            <div class="page-header">
              <div class="page-details">
                <div class="page-title" title="${pageData.title || '未知标题'}">${truncateText(pageData.title || '未知标题', 40)}</div>
                <div class="page-domain">${pageData.domain || '未知域名'}</div>
              </div>
              <div class="page-status success">✔</div>
            </div>
          </div>
        `;
      } else {
        currentPageInfo.innerHTML = `
          <div class="page-info-error">
            <span class="error-icon">⚠</span>
            <span>无法获取页面信息</span>
          </div>
        `;
      }
    } catch (error) {
      console.error('[Prompt Generator] Error updating page info:', error);
      currentPageInfo.innerHTML = `
        <div class="page-info-error">
          <span class="error-icon">✖</span>
          <span>页面信息获取失败</span>
        </div>
      `;
    }
  }

  // 开始轮询检查元素选择
  function startElementPolling() {
    setInterval(async () => {
      try {
        const result = await chrome.storage.session.get(['elementSelectedData', 'elementSelectedTimestamp']);

        if (result.elementSelectedTimestamp && result.elementSelectedTimestamp > lastElementTimestamp) {
          lastElementTimestamp = result.elementSelectedTimestamp;
          currentElementData = result.elementSelectedData;

          console.log('[Prompt Generator] New element selected:', currentElementData);

          // 渲染所选元素详情
          renderSelectedElementDetails(currentElementData);

          // 截图并生成AI指令
          try {
            const elementScreenshot = await captureElementScreenshot(currentElementData);
            currentElementData.screenshot = elementScreenshot;
          } catch (error) {
            console.warn('[Screenshot] 截图失败，继续不带图片生成:', error);
          }

          // 生成AI指令
          await generatePromptWithAI(currentElementData);

          // 自动退出选择模式
          isSelectionMode = false;
          updateSelectionButtons();

          // 清除storage中的数据
          await chrome.storage.session.remove(['elementSelectedData', 'elementSelectedTimestamp']);
        }
      } catch (error) {
        console.error('[Prompt Generator] Error in element polling:', error);
      }
    }, 500); // 每500ms检查一次
  }

  // 渲染所选元素的 HTML/文本/CSS/字体
  function renderSelectedElementDetails(elementData) {
    try {
      if (!elementData) return;
      if (selectedElementSection) selectedElementSection.style.display = 'block';

      const el = elementData.element || elementData; // 兼容两种结构
      // HTML
      const tag = el.tagName || 'div';
      let html = `<${tag}`;
      if (el.attributes) {
        Object.entries(el.attributes).forEach(([k, v]) => {
          html += ` ${k}="${v}"`;
        });
      }
      html += `>` + (el.outerHTML ? '' : (el.innerHTML || el.directText || '')) + `</${tag}>`;
      if (el.outerHTML) html = el.outerHTML;
      if (selHtmlPreview) selHtmlPreview.textContent = html;

      // 文本
      if (selTextPreview) selTextPreview.textContent = el.directText || el.innerText || '';

      // CSS（仅挑重要属性，避免过长）
      const importantProps = ['display', 'position', 'width', 'height', 'background', 'background-color', 'color', 'font-size', 'font-family', 'font-weight', 'line-height', 'border', 'border-radius', 'padding', 'margin', 'flex-direction', 'justify-content', 'align-items'];
      let cssLines = [];
      if (el.styles) {
        Object.entries(el.styles).forEach(([prop, val]) => {
          if (importantProps.includes(prop) && val != null && val !== '') {
            cssLines.push(`${prop}: ${val};`);
          }
        });
      }
      if (selCssPreview) selCssPreview.textContent = cssLines.join('\n');

      // 字体信息
      if (el.fonts && Array.isArray(el.fonts.used)) {
        if (selFontsPreview) selFontsPreview.textContent = el.fonts.used.join('\n');
      } else if (selFontsPreview) {
        selFontsPreview.textContent = '';
      }

      // 新增：元素属性
      if (selAttrsPreview) {
        let attrsText = '';
        if (el.attributes && Object.keys(el.attributes).length > 0) {
          attrsText = Object.entries(el.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else {
          attrsText = '无属性';
        }
        selAttrsPreview.textContent = attrsText;
      }

      // 新增：尺寸位置
      if (selDimensionsPreview) {
        let dimensionsText = '';
        const dimensions = el.dimensions || el.rect;
        if (dimensions) {
          dimensionsText = `宽度: ${Math.round(dimensions.width)}px
高度: ${Math.round(dimensions.height)}px
X坐标: ${Math.round(dimensions.x)}px
Y坐标: ${Math.round(dimensions.y)}px
左侧: ${Math.round(dimensions.left)}px
顶部: ${Math.round(dimensions.top)}px
右侧: ${Math.round(dimensions.right)}px
底部: ${Math.round(dimensions.bottom)}px`;
        } else {
          dimensionsText = '尺寸信息不可用';
        }
        selDimensionsPreview.textContent = dimensionsText;
      }

      // 新增：元素路径
      if (selPathPreview) {
        let pathText = '';
        if (el.selector) {
          pathText += `CSS选择器: ${el.selector}\n`;
        }
        if (el.xpath) {
          pathText += `XPath: ${el.xpath}\n`;
        }
        if (el.tagName) {
          pathText += `标签名: ${el.tagName}\n`;
        }
        if (el.id) {
          pathText += `ID: ${el.id}\n`;
        }
        if (el.className) {
          pathText += `类名: ${el.className}\n`;
        }
        if (!pathText) {
          pathText = '路径信息不可用';
        }
        selPathPreview.textContent = pathText.trim();
      }

      // 新增：页面信息
      if (selPageInfoPreview) {
        const pageContext = elementData.pageContext || {};
        let pageInfoText = `页面标题: ${pageContext.title || '未知'}
页面URL: ${pageContext.url || '未知'}
域名: ${pageContext.domain || '未知'}
协议: ${pageContext.protocol || '未知'}
选择时间: ${new Date(elementData.timestamp || Date.now()).toLocaleString()}
用户代理: ${navigator.userAgent.substring(0, 100)}...`;
        selPageInfoPreview.textContent = pageInfoText;
      }

      // 新增：截图显示
      if (elementData.screenshot && selScreenshotPreview && screenshotSection) {
        screenshotSection.style.display = 'block';
        selScreenshotPreview.innerHTML = `<img src="${elementData.screenshot}" alt="元素截图" />`;
      } else if (screenshotSection) {
        screenshotSection.style.display = 'none';
      }

    } catch (e) {
      console.error('[Prompt] renderSelectedElementDetails error', e);
    }
  }

  // 生成AI指令（使用OpenRouter API）
  // OpenRouter API 配置
  const OPENROUTER_API_KEY = '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';
  const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

  // 测试API连接
  async function testOpenRouterAPI() {
    try {
      console.log('[API Test] Testing OpenRouter connection...');
      console.log('[API Test] API Key length:', OPENROUTER_API_KEY.length);
      console.log('[API Test] API Key starts with:', OPENROUTER_API_KEY.substring(0, 10) + '...');

      // 先测试简单的模型列表API
      const modelsResponse = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin || 'chrome-extension://unknown',
          'X-Title': 'AI-Programming-Prompt-Generator'
        }
      });

      console.log('[API Test] Models API status:', modelsResponse.status);

      if (modelsResponse.ok) {
        console.log('[API Test] ✅ API Key验证成功，开始测试聊天API');

        // 测试聊天API
        const testResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin || 'chrome-extension://unknown',
            'X-Title': 'AI-Programming-Prompt-Generator'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: '测试连接，请回复OK'
              }
            ],
            max_tokens: 10
          })
        });

        console.log('[API Test] Chat API status:', testResponse.status);
        const testResult = await testResponse.text();
        console.log('[API Test] Chat API response:', testResult);

        if (testResponse.ok) {
          console.log('[API Test] ✅ 聊天API测试成功');
          return true;
        } else {
          console.error('[API Test] ❌ 聊天API测试失败:', testResult);
          return false;
        }
      } else {
        const errorText = await modelsResponse.text();
        console.error('[API Test] ❌ API Key验证失败:', errorText);
        return false;
      }
    } catch (error) {
      console.error('[API Test] ❌ 连接测试异常:', error);
      console.error('[API Test] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  // 构建智能prompt模板
  function buildPromptTemplate(elementData) {
    console.log('[Prompt Builder] 原始elementData:', elementData);

    const element = elementData.element || elementData;
    const pageContext = elementData.pageContext || {};

    console.log('[Prompt Builder] 提取的element:', element);
    console.log('[Prompt Builder] pageContext:', pageContext);

    // 提取核心信息
    const tagName = element.tagName || 'div';
    const textContent = element.directText || element.innerText || '';
    const outerHTML = element.outerHTML || '';
    const innerHTML = element.innerHTML || '';

    console.log('[Prompt Builder] 基础信息:', {
      tagName,
      textContent: textContent.substring(0, 100),
      outerHTMLLength: outerHTML.length,
      innerHTMLLength: innerHTML.length
    });

    // 处理样式信息
    const styles = element.styles || {};
    console.log('[Prompt Builder] 原始styles:', styles);

    const importantStyles = [
      // 布局和定位
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',

      // 背景和颜色
      'background', 'background-color', 'background-image', 'background-size',
      'background-position', 'background-repeat', 'background-attachment',
      'color', 'opacity',

      // 字体和文本
      'font-size', 'font-family', 'font-weight', 'font-style', 'font-variant',
      'line-height', 'text-align', 'text-decoration', 'text-transform',
      'letter-spacing', 'word-spacing', 'text-shadow', 'white-space',

      // 边框和轮廓
      'border', 'border-width', 'border-style', 'border-color', 'border-radius',
      'border-top', 'border-right', 'border-bottom', 'border-left',
      'outline', 'outline-width', 'outline-style', 'outline-color',

      // 间距
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',

      // 视觉效果
      'box-shadow', 'text-shadow', 'filter', 'backdrop-filter',

      // Flexbox
      'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
      'align-content', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap',

      // Grid
      'grid-template-columns', 'grid-template-rows', 'grid-gap', 'grid-area',
      'justify-items', 'align-items',

      // 动画和过渡
      'transition', 'transition-property', 'transition-duration', 'transition-timing-function',
      'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
      'transform', 'transform-origin',

      // 其他重要属性
      'overflow', 'overflow-x', 'overflow-y', 'visibility', 'cursor',
      'user-select', 'pointer-events', 'box-sizing', 'vertical-align'
    ];

    const relevantStyles = {};
    importantStyles.forEach(prop => {
      if (styles[prop] &&
        styles[prop] !== 'initial' &&
        styles[prop] !== '' &&
        !(styles[prop] === 'auto' && !['width', 'height', 'margin', 'padding'].includes(prop)) &&
        !(styles[prop] === 'none' && !['border', 'text-decoration', 'transform', 'animation'].includes(prop))) {
        relevantStyles[prop] = styles[prop];
      }
    });

    console.log('[Prompt Builder] 过滤后的relevantStyles:', relevantStyles);

    // 字体信息
    const fontInfo = element.fonts || {};
    const usedFonts = fontInfo.used || [];
    console.log('[Prompt Builder] 字体信息:', fontInfo, usedFonts);

    // 构建详细的prompt
    const stylesCount = Object.keys(relevantStyles).length;
    const hasHTML = outerHTML.length > 0;
    const hasText = textContent.length > 0;

    const prompt = `你是一位专业的前端开发专家。请基于以下真实网页元素的精确数据${elementData.screenshot ? '和提供的元素截图' : ''}，生成一个**完全匹配原样式**的HTML代码。这个代码将用于完美复刻原始元素的视觉效果和交互体验。

## 📷 重要提示
${elementData.screenshot ? '我已经为你提供了该元素的实际截图。请结合图像中的视觉效果和下方的技术数据，确保生成的代码能够完美还原截图中看到的外观。' : '注意：仅基于文本数据生成代码，请确保样式的准确性。'}

## 🎯 精确提取的元素数据

### HTML结构（请完全保持一致）
\`\`\`html
${hasHTML ? outerHTML : `<${tagName}>${innerHTML || textContent}</${tagName}>`}
\`\`\`

### 精确的CSS样式属性（必须全部使用）
${stylesCount > 0 ? Object.entries(relevantStyles).map(([prop, value]) => `${prop}: ${value};`).join('\n') : '无特殊样式'}

### 元素详细信息
- 标签类型: ${tagName}
- 实际尺寸: ${element.dimensions ? `${Math.round(element.dimensions.width)}x${Math.round(element.dimensions.height)}px` : '未知'}
- Class属性: ${element.attributes?.class || '无'}
- 文本内容: ${textContent || '无文本'}

## ⚠️ 关键要求

### 1. 视觉还原准确性
${elementData.screenshot ? '- **以截图为准**：如果CSS数据与截图中的视觉效果有差异，优先按照截图的实际外观调整\n- **细节观察**：仔细观察截图中的阴影、渐变、圆角、边框等细节效果\n- **颜色匹配**：确保生成的元素颜色与截图中完全一致\n- **尺寸比例**：保持元素的宽高比例与截图一致' : '- **必须使用上述所有CSS属性**，不得遗漏任何一个\n- **数值必须完全一致**，包括px、rem、%等单位\n- **颜色值必须精确**，RGB、HEX值不得更改'}
- **字体必须匹配**：包括font-family、font-weight、font-size

### 2. 交互状态补充
请为元素添加常见的交互状态（如果是交互元素）：
- **:hover** 状态：添加合适的悬停效果
- **:active** 状态：添加点击时的效果
- **:focus** 状态：添加焦点状态样式

### 3. 代码结构要求
生成一个完整的HTML文件，包含：
- DOCTYPE和完整HTML5结构
- 内联CSS样式（在<style>标签中）
- 为目标元素创建CSS类名".target-element"
- 元素代码中添加target-element类

### 4. 输出格式
请严格按照以下模板输出：

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>提取的页面元素</title>
    <style>
        .target-element {
            /* 在这里放置上述所有CSS属性 */
        }
        
        /* 交互状态（如果适用） */
        .target-element:hover {
            /* 悬停效果 */
        }
        
        .target-element:active {
            /* 激活效果 */
        }
        
        .target-element:focus {
            /* 焦点效果 */
        }
    </style>
</head>
<body>
    <!-- 在这里放置HTML结构，并添加target-element类 -->
</body>
</html>
\`\`\`

## 💡 使用说明
简要说明这个元素的用途和特点，以及在项目中的集成建议。

**重要提醒**: ${elementData.screenshot ? '请结合截图和技术数据，确保生成的代码能够完美还原截图中的视觉效果！图片中的每一个视觉细节都很重要。' : '请确保生成的代码能够完美还原原始元素的视觉效果！'}`;

    console.log('[Prompt Builder] 最终prompt长度:', prompt.length);
    console.log('[Prompt Builder] Prompt预览:', prompt.substring(0, 500) + '...');

    // 显示完整的传递给AI的数据摘要
    console.log('[Prompt Builder] === 传递给AI的数据摘要 ===');
    console.log('HTML长度:', outerHTML.length, '字符');
    console.log('CSS属性数量:', stylesCount, '个');
    console.log('文本内容:', textContent ? `"${textContent.substring(0, 50)}..."` : '无');
    console.log('元素属性:', element.attributes ? Object.keys(element.attributes).length : 0, '个');
    console.log('字体信息:', usedFonts.length ? usedFonts.join(', ') : '无');
    console.log('实际CSS属性:', Object.keys(relevantStyles));
    console.log('=========================');

    return prompt;
  }

  // 截取元素图片
  async function captureElementScreenshot(elementData) {
    try {
      console.log('[Screenshot] 开始截图，元素数据:', elementData);

      // 获取当前标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('无法获取当前标签页');
      }

      // 截取整个可见区域
      const fullScreenshot = await chrome.tabs.captureVisibleTab(tabs[0].windowId, {
        format: 'png',
        quality: 100
      });

      console.log('[Screenshot] 全屏截图完成，开始裁剪元素区域');

      // 获取元素位置信息
      const element = elementData.element || elementData;
      const rect = element.rect || element.dimensions;

      if (!rect) {
        console.warn('[Screenshot] 缺少元素位置信息，返回全屏截图');
        return fullScreenshot;
      }

      // 创建Canvas裁剪元素区域
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // 获取设备像素比
            const devicePixelRatio = window.devicePixelRatio || 1;

            // 计算实际截图尺寸（考虑设备像素比）
            const actualX = rect.x * devicePixelRatio;
            const actualY = rect.y * devicePixelRatio;
            const actualWidth = rect.width * devicePixelRatio;
            const actualHeight = rect.height * devicePixelRatio;

            // 设置Canvas尺寸
            canvas.width = actualWidth;
            canvas.height = actualHeight;

            console.log('[Screenshot] 裁剪区域:', {
              x: actualX,
              y: actualY,
              width: actualWidth,
              height: actualHeight,
              devicePixelRatio
            });

            // 裁剪元素区域
            ctx.drawImage(
              img,
              actualX, actualY, actualWidth, actualHeight,  // 源区域
              0, 0, actualWidth, actualHeight               // 目标区域
            );

            // 转换为base64
            const croppedScreenshot = canvas.toDataURL('image/png', 1.0);
            console.log('[Screenshot] 元素截图完成，图片大小:', croppedScreenshot.length);

            resolve(croppedScreenshot);
          } catch (error) {
            console.error('[Screenshot] 图片处理失败:', error);
            resolve(fullScreenshot); // 失败时返回全屏截图
          }
        };

        img.onerror = () => {
          console.error('[Screenshot] 图片加载失败');
          resolve(fullScreenshot); // 失败时返回全屏截图
        };

        img.src = fullScreenshot;
      });

    } catch (error) {
      console.error('[Screenshot] 截图失败:', error);
      throw error;
    }
  }

  // 调用OpenRouter API生成prompt
  async function generatePromptWithAI(elementData) {
    if (!elementData || !promptOutput) return;

    try {
      showStatusMessage('🔮 AI正在提取元素代码...', 'info');

      // 显示加载状态
      promptOutput.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 40px 20px; color: #666;">
          <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #9b59b6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
          <h3 style="margin: 0 0 10px 0; color: #333;">🤖 AI正在工作中...</h3>
          <p style="margin: 0; font-size: 14px;">正在提取元素结构和样式，生成完整代码</p>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;

      // 构建智能prompt
      const promptTemplate = buildPromptTemplate(elementData);

      console.log('[OpenRouter Debug] API Key:', OPENROUTER_API_KEY ? 'Present' : 'Missing');
      console.log('[OpenRouter Debug] Base URL:', OPENROUTER_BASE_URL);
      console.log('[OpenRouter Debug] Prompt length:', promptTemplate.length);

      // 构建消息内容，支持图片
      const messageContent = [{
        type: 'text',
        text: promptTemplate.substring(0, 8000) // 限制prompt长度避免过长
      }];

      // 如果有截图，添加到消息中
      if (elementData.screenshot) {
        console.log('[OpenRouter Debug] 包含元素截图，图片大小:', elementData.screenshot.length);
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: elementData.screenshot,
            detail: 'high' // 使用高质量分析
          }
        });
      } else {
        console.log('[OpenRouter Debug] 无截图，仅使用文本描述');
      }

      const requestBody = {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      };

      console.log('[OpenRouter Debug] Request body:', JSON.stringify(requestBody, null, 2));

      // 先测试API连接（临时禁用以排查问题）
      console.log('[Debug] 跳过API测试，直接尝试调用...');

      // 调用OpenRouter API
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'chrome-extension://unknown',
          'X-Title': 'AI-Programming-Prompt-Generator'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[OpenRouter Debug] Response status:', response.status);
      console.log('[OpenRouter Debug] Response headers:', [...response.headers.entries()]);

      const responseText = await response.text();
      console.log('[OpenRouter Debug] Response text:', responseText);

      if (!response.ok) {
        throw new Error(`OpenRouter API Error ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('[OpenRouter Debug] Parsed result:', result);

      const aiPrompt = result.choices?.[0]?.message?.content || '生成失败';

      if (!aiPrompt || aiPrompt === '生成失败') {
        throw new Error('API返回内容为空或格式异常');
      }

      // 显示生成的代码
      promptOutput.innerHTML = `
        <div class="prompt-container">
          <div class="prompt-header">
            <h3>🔧 提取的元素代码</h3>
            <div class="prompt-meta">
              <span class="prompt-source">来源: ${elementData.pageContext?.domain || '未知网站'}</span>
              <span class="prompt-time">${new Date().toLocaleTimeString()}</span>
              <span class="prompt-model">模型: GPT-4o Mini via OpenRouter</span>
            </div>
          </div>
          <div class="prompt-content">
            <pre class="prompt-text"></pre>
          </div>
        </div>
      `;

      // 安全地设置代码文本，避免HTML被渲染
      const preElement = promptOutput.querySelector('.prompt-text');
      if (preElement) {
        preElement.textContent = aiPrompt; // 使用 textContent 而不是 innerHTML
      }

      // 显示复制和清除按钮
      if (copyPromptBtn) copyPromptBtn.style.display = 'inline-flex';
      if (clearPromptBtn) clearPromptBtn.style.display = 'inline-flex';

      showStatusMessage('✔ 元素代码提取完成！', 'success');
    } catch (error) {
      console.error('[Prompt Generator] Error generating AI prompt:', error);
      console.error('[Prompt Generator] Error stack:', error.stack);

      let errorMessage = error.message;
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络连接';
      } else if (errorMessage.includes('401')) {
        errorMessage = 'API密钥无效，请检查OpenRouter API Key';
      } else if (errorMessage.includes('429')) {
        errorMessage = 'API调用频率超限，请稍后重试';
      } else if (errorMessage.includes('403')) {
        errorMessage = 'API访问被拒绝，请检查账户余额或权限';
      }

      showStatusMessage('✖ 元素代码提取失败: ' + errorMessage, 'error');

      // 显示详细错误信息
      if (promptOutput) {
        promptOutput.innerHTML = `
          <div class="error-container" style="padding: 20px; border: 2px solid #ff6b6b; border-radius: 8px; background: #ffe0e0; margin: 10px 0;">
            <h3 style="color: #d63031; margin-top: 0;">⚠️ 生成失败</h3>
            <p><strong>错误原因:</strong> ${errorMessage}</p>
            <p><strong>详细信息:</strong> ${error.message}</p>
            <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 4px; font-family: monospace; font-size: 12px; color: #666;">
              <strong>调试信息:</strong><br/>
              • API Key: ${OPENROUTER_API_KEY ? '已配置' : '未配置'}<br/>
              • API端点: ${OPENROUTER_BASE_URL}/chat/completions<br/>
              • 错误时间: ${new Date().toLocaleString()}
            </div>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
              💡 <strong>排查建议:</strong><br/>
              1. 检查浏览器开发者工具的Console面板查看详细日志<br/>
              2. 确认OpenRouter账户有足够余额<br/>
              3. 验证API Key是否正确配置
            </p>
          </div>
        `;
      }
    }
  }

  // 处理选择元素按钮点击
  async function handleSelectElement() {
    try {
      // 获取当前激活的标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        showStatusMessage('✖ 无法获取当前标签页', 'error');
        return;
      }

      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000);

        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'enterSelectionMode'
        }, (response) => {
          clearTimeout(timeout);

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          resolve(response);
        });
      });

      if (response?.success) {
        isSelectionMode = true;
        updateSelectionButtons();
        showStatusMessage('选择模式已激活，请在页面中点击要分析的元素', 'info');
      } else {
        showStatusMessage('✖ 无法激活选择模式：' + (response?.error || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('[Prompt Generator] Error entering selection mode:', error);
      showStatusMessage('✖ 激活选择模式失败', 'error');
    }
  }

  // 处理退出选择按钮点击
  async function handleExitSelection() {
    try {
      // 获取当前激活的标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        showStatusMessage('✖ 无法获取当前标签页', 'error');
        return;
      }

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000);

        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'exitSelectionMode'
        }, (response) => {
          clearTimeout(timeout);

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          resolve(response);
        });
      });

      isSelectionMode = false;
      updateSelectionButtons();
      showStatusMessage('选择模式已退出', 'success');
    } catch (error) {
      console.error('[Prompt Generator] Error exiting selection mode:', error);
      showStatusMessage('✖ 退出选择模式失败', 'error');
    }
  }

  // 更新选择按钮状态
  function updateSelectionButtons() {
    if (!selectElementBtn || !exitSelectionBtn) return;

    if (isSelectionMode) {
      selectElementBtn.style.display = 'none';
      exitSelectionBtn.style.display = 'inline-flex';
    } else {
      selectElementBtn.style.display = 'inline-flex';
      exitSelectionBtn.style.display = 'none';
    }
  }

  // 处理复制AI指令
  async function handleCopyPrompt() {
    const promptText = promptOutput?.querySelector('.prompt-text')?.textContent;
    if (!promptText) {
      showStatusMessage('✖ 没有可复制的代码', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(promptText);
      showStatusMessage('✔ 元素代码已复制到剪贴板！', 'success');

      // 临时改变按钮文本
      const originalText = copyPromptBtn.textContent;
      copyPromptBtn.textContent = '已复制!';
      setTimeout(() => {
        copyPromptBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error('[Prompt Generator] Error copying prompt:', error);
      showStatusMessage('✖ 复制失败，请手动选择文本复制', 'error');
    }
  }

  // 处理清除AI指令输出
  function handleClearPrompt() {
    if (promptOutput) {
      promptOutput.innerHTML = '<div class="output-placeholder">选择页面元素后，提取的完整代码将显示在这里</div>';
    }

    if (copyPromptBtn) copyPromptBtn.style.display = 'none';
    if (clearPromptBtn) clearPromptBtn.style.display = 'none';

    currentElementData = null;
    showStatusMessage('输出已清除', 'success');
  }

  // ===========================================
  // 功能2：页面数据提取
  // ===========================================

  // 获取当前页面数据
  async function getCurrentPageData() {
    try {
      console.log('[Page Analyzer] Getting current page data...');

      // 检查Chrome扩展API是否可用
      if (!chrome || !chrome.tabs) {
        console.error('[Page Analyzer] Chrome extension API not available');
        updatePageInfoDisplay(null, 'Chrome extension API not available');
        return null;
      }

      // 获取当前激活的标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        console.error('[Page Analyzer] No active tab found');
        updatePageInfoDisplay(null, 'No active tab found');
        return null;
      }

      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000); // 10秒超时

        chrome.tabs.sendMessage(tabs[0].id, {
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
        updatePageInfoDisplay(currentPageData);
        console.log('[Page Analyzer] Page data updated:', currentPageData);
        return currentPageData;
      } else {
        console.error('[Page Analyzer] Failed to get page data:', response?.error);
        updatePageInfoDisplay(null, response?.error || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error('[Page Analyzer] Error getting page data:', error);
      updatePageInfoDisplay(null, error.message);
      return null;
    }
  }

  // 更新页面信息显示（用于页面分析功能）
  function updatePageInfoDisplay(pageData, error) {
    if (!pageInfoDisplay) return;

    if (error) {
      pageInfoDisplay.innerHTML = `
        <div class="page-info-error">
          <span class="error-icon">⚠</span>
          <span>无法获取页面信息: ${error}</span>
        </div>
      `;
      if (togglePageDataBtn) togglePageDataBtn.style.display = 'none';
      return;
    }

    if (!pageData) {
      pageInfoDisplay.innerHTML = `
        <div class="page-info-empty">
          <span>未检测到页面信息</span>
        </div>
      `;
      if (togglePageDataBtn) togglePageDataBtn.style.display = 'none';
      return;
    }

    const domain = pageData.domain || '未知域名';
    const title = pageData.title || '未知标题';
    const url = pageData.url || '';

    pageInfoDisplay.innerHTML = `
      <div class="page-info-content">
        <div class="page-info-header">
          <div class="page-header">
            <div class="page-details">
              <div class="page-title" title="${title}">${truncateText(title, 30)}</div>
              <div class="page-domain">${domain}</div>
            </div>
            <div class="page-status ${pageData.error ? 'error' : 'success'}">
              ${pageData.error ? '✖' : '✔'}
            </div>
          </div>
        </div>
        ${pageData.textContent ? `
          <div class="page-stats">
            <span> ${pageData.textContent.paragraphs?.length || 0} 段落</span>
            <span> ${pageData.textContent.links?.length || 0} 链接</span>
            <span> ${pageData.styles?.externalStylesheets?.length || 0} 样式表</span>
            <span> ${pageData.fonts?.summary?.totalFontResources || 0} 字体文件</span>
          </div>
        ` : ''}
      </div>
    `;

    // 如果有详细的页面数据，显示查看按钮
    if (pageData.htmlSource || pageData.textContent || pageData.styles || pageData.fonts) {
      if (togglePageDataBtn) togglePageDataBtn.style.display = 'block';
      updatePageDataDetails(pageData);
    } else {
      if (togglePageDataBtn) togglePageDataBtn.style.display = 'none';
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
          textSummary += `${i + 1}. ${p.substring(0, 200)}${p.length > 200 ? '...' : ''}\n`;
        });
        if (pageData.textContent.paragraphs.length > 10) {
          textSummary += `\n... 还有 ${pageData.textContent.paragraphs.length - 10} 个段落\n`;
        }
      }
      if (pageData.textContent.links) {
        textSummary += '\n=== 页面链接 ===\n';
        pageData.textContent.links.slice(0, 20).forEach((link, i) => {
          textSummary += `${i + 1}. ${link.text} -> ${link.href}\n`;
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
          cssSummary += `${i + 1}. ${sheet.href || sheet.title || '未知样式表'}\n`;
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
          fontsSummary += `${i + 1}. ${font.name}\n`;
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
          fontsSummary += `${i + 1}. ${font}\n`;
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
              fontsSummary += `${i + 1}. ${font.family}\n`;
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
    if (pageDataDetails && togglePageDataBtn) {
      if (pageDataDetails.style.display === 'none') {
        pageDataDetails.style.display = 'block';
        togglePageDataBtn.textContent = '隐藏页面数据';
      } else {
        pageDataDetails.style.display = 'none';
        togglePageDataBtn.textContent = '查看页面数据';
      }
    }
  }

  // ===========================================
  // 功能3：PRD生成
  // ===========================================

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

  // 主要的PRD生成处理函数
  async function handleGenerate() {
    const idea = (ideaInput.value || '').trim();
    if (!idea) {
      if (outputEl) outputEl.textContent = '请先输入你的应用想法。';
      return;
    }

    setLoading(true);
    if (outputEl) outputEl.textContent = '';
    if (copyBtn) copyBtn.style.display = 'none';
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
        workflow_type: 'prd', // 使用PRD工作流
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
      if (outputEl) outputEl.textContent = '';

      const resp = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      // 清空输入框
      if (ideaInput) ideaInput.value = '';

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
                if (outputEl) outputEl.setAttribute('data-raw-answer', acc);
                // 自动滚动到底部
                if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
              } else if (json.type === 'html_partial' && json.html) {
                // 流式增量 HTML，边流边渲染（节流避免抖动）
                hasHtml = true;
                pendingHtml = json.html;
                const now = Date.now();
                if (now - lastHtmlFlush > HTML_UPDATE_INTERVAL) {
                  if (outputEl) outputEl.innerHTML = pendingHtml;
                  lastHtmlFlush = now;
                }
              } else if (json.type === 'html' && json.html) {
                // 服务端已渲染 HTML（忠实渲染），优先展示
                hasHtml = true;
                if (outputEl) outputEl.innerHTML = json.html;
                lastHtmlFlush = Date.now();
              } else if (json.type === 'conversation') {
                // 记录后端返回的会话ID便于续聊（仅内存保存）
                dbConversationId = json.conversation_id || dbConversationId;
                difyConversationId = json.dify_conversation_id || difyConversationId;
              }
            } catch (parseError) {
              // 忽略解析错误
              console.log('[PRD Generator] Parse error:', parseError);
            }
          }
        }
      }

      // 收尾：如已进入 HTML 模式，确保最后一次刷新；否则保留纯文本
      if (hasHtml) {
        if (pendingHtml && outputEl) outputEl.innerHTML = pendingHtml;
      } else if (acc) {
        renderMarkdown(acc);
      }

      if ((acc || hasHtml) && copyBtn) {
        copyBtn.style.display = 'inline-flex';
      }

    } catch (e) {
      if (outputEl) outputEl.textContent = `生成失败：${e?.message || e}`;
    } finally {
      setLoading(false);
    }
  }

  // PRD复制功能
  async function handleCopy() {
    try {
      // 优先复制 Dify 原始 answer 文本（acc 累积的原文）
      const raw = outputEl?.getAttribute('data-raw-answer');
      const text = raw != null ? raw : (outputEl?.textContent || '');
      await navigator.clipboard.writeText(text);
      if (copyBtn) copyBtn.textContent = '已复制';
      setTimeout(() => { if (copyBtn) copyBtn.textContent = '一键复制'; }, 1200);
    } catch (error) {
      console.error('[PRD Generator] Copy failed:', error);
    }
  }

  // 新对话：清空会话ID与展示
  function handleNewChat() {
    dbConversationId = null;
    difyConversationId = null;
    if (outputEl) outputEl.innerHTML = '';
    if (ideaInput) ideaInput.focus();
  }

  // ===========================================
  // 事件监听器绑定
  // ===========================================

  function bindEventListeners() {
    // 选项卡切换
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // 功能1：智能Prompt生成
    selectElementBtn?.addEventListener('click', handleSelectElement);
    exitSelectionBtn?.addEventListener('click', handleExitSelection);
    copyPromptBtn?.addEventListener('click', handleCopyPrompt);
    clearPromptBtn?.addEventListener('click', handleClearPrompt);

    // 功能2：页面数据提取
    refreshPageBtn?.addEventListener('click', async () => {
      if (refreshPageBtn) {
        refreshPageBtn.disabled = true;
        refreshPageBtn.textContent = '刷新中...';
      }

      await getCurrentPageData();

      if (refreshPageBtn) {
        refreshPageBtn.disabled = false;
        refreshPageBtn.textContent = '刷新';
      }
    });

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
            fullText += `${i + 1}. ${p}\n`;
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
              fullCss += `${i + 1}. ${style}\n`;
            } else {
              fullCss += `${i + 1}. ${style.element}: ${style.style}\n`;
            }
          });
          fullCss += '\n';
        }

        if (currentPageData.styles.externalStylesheets?.length > 0) {
          fullCss += '=== 外部样式表 ===\n';
          currentPageData.styles.externalStylesheets.forEach((sheet, i) => {
            fullCss += `${i + 1}. ${sheet.href || sheet.title || '未知样式表'}\n`;
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
            fullFonts += `${i + 1}. ${font.name}\n`;
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
            fullFonts += `${i + 1}. ${font}\n`;
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
                fullFonts += `${i + 1}. ${font.family || '字体声明'}\n`;
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

    // 所选元素复制按钮
    const bindCopy = (btn, preview, label) => {
      btn?.addEventListener('click', () => {
        const text = preview?.textContent || '';
        if (text) copyToClipboard(text, btn, label || '复制');
      });
    };
    bindCopy(copySelHtmlBtn, selHtmlPreview, '复制HTML');
    bindCopy(copySelTextBtn, selTextPreview, '复制文本');
    bindCopy(copySelCssBtn, selCssPreview, '复制CSS');
    bindCopy(copySelFontsBtn, selFontsPreview, '复制字体');
    bindCopy(copySelHtmlBtn2, selHtmlPreview, '复制');
    bindCopy(copySelTextBtn2, selTextPreview, '复制');
    bindCopy(copySelCssBtn2, selCssPreview, '复制');
    bindCopy(copySelFontsBtn2, selFontsPreview, '复制');

    // 新增信息项的复制按钮
    bindCopy(copySelAttrsBtn, selAttrsPreview, '复制');
    bindCopy(copySelDimensionsBtn, selDimensionsPreview, '复制');
    bindCopy(copySelPathBtn, selPathPreview, '复制');
    bindCopy(copySelPageInfoBtn, selPageInfoPreview, '复制');

    // 截图下载按钮
    copySelScreenshotBtn?.addEventListener('click', () => {
      if (currentElementData?.screenshot) {
        const link = document.createElement('a');
        link.href = currentElementData.screenshot;
        link.download = 'element-screenshot.png';
        link.click();
      }
    });

    // 功能3：PRD生成
    generateBtn?.addEventListener('click', handleGenerate);
    copyBtn?.addEventListener('click', handleCopy);
    newChatBtn?.addEventListener('click', handleNewChat);

    // Enter 发送，Shift+Enter 换行
    ideaInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    });
  }

  // ===========================================
  // 标签页变化监听
  // ===========================================

  // 监听标签页变化
  async function handleTabChange() {
    console.log('[AI Assistant] Tab changed, refreshing page data...');

    // 显示刷新状态
    if (refreshPageBtn) {
      refreshPageBtn.disabled = true;
      refreshPageBtn.textContent = '正在同步...';
    }

    // 清除旧数据
    currentPageData = null;
    if (activeTab === 'page') {
      updatePageInfoDisplay(null, '正在获取当前页面信息...');
    } else if (activeTab === 'prompt') {
      updatePageInfo();
    }

    // 重新获取当前页面数据
    await getCurrentPageData();

    // 恢复按钮状态
    if (refreshPageBtn) {
      refreshPageBtn.disabled = false;
      refreshPageBtn.textContent = '刷新';
    }
  }

  // ===========================================
  // 初始化函数
  // ===========================================

  async function initializeApp() {
    console.log('[AI Assistant] Sidepanel initializing...');

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

    // 绑定事件监听器
    bindEventListeners();

    // 开始元素选择轮询（用于智能Prompt功能）
    startElementPolling();

    // 延迟一下再获取页面数据，确保Chrome API准备就绪
    setTimeout(async () => {
      console.log('[AI Assistant] Starting to get page data...');
      await updatePageInfo(); // 初始化页面信息
      await getCurrentPageData(); // 获取详细页面数据
    }, 1000);
  }

  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})();