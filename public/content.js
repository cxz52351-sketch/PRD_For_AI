// content.js - AI编程提示词生成器内容脚本
console.log('[Prompt Generator] Content script loaded');

// 全局状态管理
let isSelectionMode = false;
let highlightedElement = null;
let currentOverlay = null;

// 样式配置
const HIGHLIGHT_STYLES = {
  border: '2px solid #007AFF',
  backgroundColor: 'rgba(0, 122, 255, 0.1)',
  cursor: 'crosshair',
  position: 'relative',
  zIndex: '9999',
  boxShadow: '0 0 0 1px rgba(0, 122, 255, 0.3)',
  transition: 'all 0.2s ease'
};

// 覆盖层样式
const OVERLAY_STYLES = {
  position: 'absolute',
  backgroundColor: 'rgba(0, 122, 255, 0.2)',
  border: '2px solid #007AFF',
  borderRadius: '4px',
  pointerEvents: 'none',
  zIndex: '10000',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
};

// 创建工具提示
function createTooltip(element, rect) {
  const tooltip = document.createElement('div');
  tooltip.id = 'prompt-generator-tooltip';
  
  const tagName = element.tagName.toLowerCase();
  const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
  const id = element.id ? `#${element.id}` : '';
  const selector = `${tagName}${id}${className}`;
  
  tooltip.innerHTML = `
    <div style="
      position: fixed;
      top: ${rect.top - 30}px;
      left: ${rect.left}px;
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 10001;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
    ">
      点击选择: ${selector}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  return tooltip;
}

// 清理工具提示
function removeTooltip() {
  const existing = document.getElementById('prompt-generator-tooltip');
  if (existing) {
    existing.remove();
  }
}

// 创建覆盖层
function createOverlay(rect) {
  const overlay = document.createElement('div');
  overlay.id = 'prompt-generator-overlay';
  
  Object.assign(overlay.style, OVERLAY_STYLES, {
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  });
  
  document.body.appendChild(overlay);
  return overlay;
}

// 移除覆盖层
function removeOverlay() {
  const existing = document.getElementById('prompt-generator-overlay');
  if (existing) {
    existing.remove();
  }
}

// 高亮元素
function highlightElement(element) {
  if (highlightedElement === element) return;
  
  // 清理之前的高亮
  clearHighlight();
  
  if (!element || element === document.body || element === document.html) return;
  
  highlightedElement = element;
  
  // 创建覆盖层而不是直接修改元素样式
  const rect = element.getBoundingClientRect();
  currentOverlay = createOverlay(rect);
  
  // 创建工具提示
  createTooltip(element, rect);
}

// 清除高亮
function clearHighlight() {
  if (highlightedElement) {
    highlightedElement = null;
  }
  
  removeOverlay();
  removeTooltip();
}

// 递归提取元素信息
function extractElementInfo(element, depth = 0, maxDepth = 10) {
  if (depth > maxDepth || !element) {
    return null;
  }
  
  const computedStyle = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // 提取重要的CSS属性
  const importantProps = [
    'display', 'position', 'width', 'height', 'margin', 'padding',
    'background-color', 'background-image', 'color', 'font-family', 
    'font-size', 'font-weight', 'line-height', 'text-align',
    'border', 'border-radius', 'box-shadow', 'flex-direction',
    'justify-content', 'align-items', 'gap', 'grid-template-columns',
    'grid-template-rows', 'z-index', 'opacity', 'transform'
  ];
  
  const styles = {};
  importantProps.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && value !== 'normal' && value !== 'none' && value !== '0px' && value !== 'auto') {
      styles[prop] = value;
    }
  });
  
  // 提取元素属性
  const attributes = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name !== 'style') { // 样式通过computedStyle获取，不需要内联样式
      attributes[attr.name] = attr.value;
    }
  }
  
  // 提取文本内容（只获取直接文本节点）
  let directText = '';
  for (let node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) directText += text + ' ';
    }
  }
  directText = directText.trim();
  
  // 构建元素信息
  const info = {
    tagName: element.tagName.toLowerCase(),
    attributes: attributes,
    styles: styles,
    innerText: (element.innerText || '').trim(),
    innerHTML: element.innerHTML || '',
    outerHTML: element.outerHTML || '',
    directText: directText,
    dimensions: {
      width: rect.width,
      height: rect.height
    },
    fonts: {
      used: (() => {
        const ff = computedStyle.getPropertyValue('font-family') || '';
        return ff
          ? ff.split(',').map(f => f.trim().replace(/['"]/g, '')).filter(Boolean)
          : [];
      })()
    },
    children: []
  };
  
  // 递归处理子元素（只处理element节点）
  for (let child of element.children) {
    // 跳过隐藏元素和不重要的元素
    const childStyle = window.getComputedStyle(child);
    if (childStyle.display !== 'none' && childStyle.visibility !== 'hidden') {
      const childInfo = extractElementInfo(child, depth + 1, maxDepth);
      if (childInfo) {
        info.children.push(childInfo);
      }
    }
  }
  
  return info;
}

// 提取页面数据（用于页面分析功能）
function extractPageData() {
  console.log('[Prompt Generator] Extracting comprehensive page data...');
  
  const pageData = {
    // 基本信息
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    
    // HTML源码
    htmlSource: document.documentElement.outerHTML,
    
    // 页面文本内容
    textContent: extractTextContent(),
    
    // CSS样式信息
    styles: extractStylesInfo(),
    
    // 字体信息
    fonts: extractFontsInfo()
  };
  
  console.log('[Prompt Generator] Page data extraction complete');
  return pageData;
}

// 提取页面文本内容
function extractTextContent() {
  const textData = {
    headings: [],
    paragraphs: [],
    links: [],
    fullText: document.body.innerText || document.body.textContent || ''
  };
  
  // 提取标题
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const text = heading.textContent.trim();
    if (text) {
      textData.headings.push({
        tag: heading.tagName.toLowerCase(),
        text: text,
        level: parseInt(heading.tagName.charAt(1))
      });
    }
  });
  
  // 提取段落
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    if (text && text.length > 10) { // 过滤过短的段落
      textData.paragraphs.push(text);
    }
  });
  
  // 提取链接
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const text = link.textContent.trim();
    const href = link.href;
    if (text && href) {
      textData.links.push({
        text: text,
        href: href,
        isExternal: !href.startsWith(window.location.origin)
      });
    }
  });
  
  return textData;
}

// 提取样式信息
function extractStylesInfo() {
  const stylesData = {
    externalStylesheets: [],
    inlineStyles: [],
    cssVariables: {},
    computedStyles: {}
  };
  
  // 提取外部样式表
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
  stylesheets.forEach((sheet, index) => {
    if (sheet.tagName === 'LINK') {
      stylesData.externalStylesheets.push({
        href: sheet.href,
        title: sheet.title || '',
        media: sheet.media || 'all'
      });
    } else if (sheet.tagName === 'STYLE') {
      stylesData.inlineStyles.push(sheet.textContent || '');
    }
  });
  
  // 提取CSS变量（从根元素）
  try {
    const rootStyle = window.getComputedStyle(document.documentElement);
    const rootStyleText = rootStyle.cssText || '';
    const variableMatches = rootStyleText.match(/--[^:]+:[^;]+/g);
    if (variableMatches) {
      variableMatches.forEach(variable => {
        const [name, value] = variable.split(':').map(s => s.trim());
        if (name && value) {
          stylesData.cssVariables[name] = value;
        }
      });
    }
  } catch (error) {
    console.log('[Prompt Generator] Failed to extract CSS variables:', error);
  }
  
  // 提取主要元素的计算样式
  const importantSelectors = ['body', 'header', 'main', 'footer', 'nav', '.main', '#main'];
  importantSelectors.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const styles = {};
      
      // 只提取重要的样式属性
      const importantProps = [
        'background-color', 'color', 'font-family', 'font-size', 
        'display', 'position', 'width', 'height', 'margin', 'padding'
      ];
      
      importantProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'normal' && value !== 'none') {
          styles[prop] = value;
        }
      });
      
      if (Object.keys(styles).length > 0) {
        stylesData.computedStyles[selector] = styles;
      }
    }
  });
  
  return stylesData;
}

// 提取字体信息
function extractFontsInfo() {
  const fontsData = {
    used: [],
    webFonts: [],
    fontResources: [],
    summary: {
      totalUsedFonts: 0,
      totalWebFonts: 0,
      totalFontResources: 0,
      totalFontSize: 0,
      fontFormats: [],
      fontDomains: []
    }
  };
  
  // 提取页面中使用的字体族
  const usedFonts = new Set();
  const elements = document.querySelectorAll('*');
  
  // 限制检查的元素数量以避免性能问题
  const elementsToCheck = Math.min(elements.length, 200);
  for (let i = 0; i < elementsToCheck; i++) {
    try {
      const element = elements[i];
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.getPropertyValue('font-family');
      
      if (fontFamily && fontFamily !== 'inherit' && fontFamily !== 'initial') {
        // 解析字体族列表
        const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
        fonts.forEach(font => {
          if (font && font !== 'serif' && font !== 'sans-serif' && font !== 'monospace') {
            usedFonts.add(font);
          }
        });
      }
    } catch (error) {
      // 忽略计算样式获取失败的情况
    }
  }
  
  fontsData.used = Array.from(usedFonts);
  
  // 提取@font-face声明
  try {
    const stylesheets = document.styleSheets;
    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const stylesheet = stylesheets[i];
        if (stylesheet.cssRules) {
          for (let j = 0; j < stylesheet.cssRules.length; j++) {
            const rule = stylesheet.cssRules[j];
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const fontFace = {
                family: rule.style.getPropertyValue('font-family').replace(/['"]/g, ''),
                src: rule.style.getPropertyValue('src'),
                weight: rule.style.getPropertyValue('font-weight'),
                style: rule.style.getPropertyValue('font-style'),
                display: rule.style.getPropertyValue('font-display'),
                cssText: rule.cssText
              };
              
              // 解析字体来源
              if (fontFace.src) {
                const urlMatches = fontFace.src.match(/url\(['"]?([^'"]+)['"]?\)/g);
                if (urlMatches) {
                  fontFace.sources = urlMatches.map(match => {
                    const url = match.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
                    const format = fontFace.src.match(new RegExp(`url\\(['"]?${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\)\\s*format\\(['"]?([^'"]+)['"]?\\)`));
                    return {
                      url: url,
                      format: format ? format[1] : 'unknown'
                    };
                  });
                }
              }
              
              fontsData.webFonts.push(fontFace);
            }
          }
        }
      } catch (error) {
        // 跨域样式表无法访问，忽略
        console.log('[Prompt Generator] Cannot access stylesheet:', error);
      }
    }
  } catch (error) {
    console.log('[Prompt Generator] Error extracting @font-face rules:', error);
  }
  
  // 模拟字体资源信息（实际应用中可能需要通过网络请求获取）
  fontsData.webFonts.forEach(webFont => {
    if (webFont.sources) {
      webFont.sources.forEach(source => {
        try {
          const url = new URL(source.url, window.location.href);
          const format = source.format || 'unknown';
          const domain = url.hostname;
          
          fontsData.fontResources.push({
            name: webFont.family || 'Unknown Font',
            url: source.url,
            domain: domain,
            format: format,
            size: 0, // 实际大小需要通过网络请求获取
            status: 'unknown',
            loadTime: 0
          });
          
          if (!fontsData.summary.fontFormats.includes(format)) {
            fontsData.summary.fontFormats.push(format);
          }
          
          if (!fontsData.summary.fontDomains.includes(domain)) {
            fontsData.summary.fontDomains.push(domain);
          }
        } catch (error) {
          console.log('[Prompt Generator] Error parsing font URL:', source.url, error);
        }
      });
    }
  });
  
  // 更新统计信息
  fontsData.summary.totalUsedFonts = fontsData.used.length;
  fontsData.summary.totalWebFonts = fontsData.webFonts.length;
  fontsData.summary.totalFontResources = fontsData.fontResources.length;
  
  return fontsData;
}

// 鼠标移动事件处理
function handleMouseOver(event) {
  if (!isSelectionMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  highlightElement(element);
}

// 鼠标离开事件处理
function handleMouseOut(event) {
  if (!isSelectionMode) return;
  
  // 不立即清除高亮，让用户有时间点击
}

// 点击事件处理
function handleClick(event) {
  if (!isSelectionMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  console.log('[Prompt Generator] Element clicked:', element);
  
  // 提取元素信息
  const elementInfo = extractElementInfo(element);
  
  if (elementInfo) {
    console.log('[Prompt Generator] Element info extracted:', elementInfo);
    
    // 构建完整的元素数据包
    const elementData = {
      element: elementInfo,
      pageContext: {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
      }
    };
    
    // 将数据存储到session storage，供sidepanel轮询检查
    chrome.storage.session.set({
      elementSelectedData: elementData,
      elementSelectedTimestamp: Date.now()
    }).then(() => {
      console.log('[Prompt Generator] Element data saved to session storage');
    }).catch((error) => {
      console.error('[Prompt Generator] Failed to save element data:', error);
    });
    
    // 同时通过消息API发送（保持兼容性）
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      data: elementData
    }).catch((error) => {
      console.log('[Prompt Generator] Runtime message failed (expected if no background listener):', error);
    });
    
    // 清除高亮并退出选择模式
    clearHighlight();
    exitSelectionMode();
  }
}

// 进入选择模式
function enterSelectionMode() {
  console.log('[Prompt Generator] Entering selection mode');
  isSelectionMode = true;
  
  // 添加事件监听器
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('click', handleClick, true);
  
  // 改变鼠标样式
  document.body.style.cursor = 'crosshair';
  
  // 显示提示信息
  showModeIndicator();
}

// 退出选择模式
function exitSelectionMode() {
  console.log('[Prompt Generator] Exiting selection mode');
  isSelectionMode = false;
  
  // 移除事件监听器
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('click', handleClick, true);
  
  // 恢复鼠标样式
  document.body.style.cursor = '';
  
  // 清除高亮
  clearHighlight();
  
  // 移除模式指示器
  hideModeIndicator();
}

// 显示模式指示器
function showModeIndicator() {
  // 移除已存在的指示器
  hideModeIndicator();
  
  const indicator = document.createElement('div');
  indicator.id = 'prompt-generator-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007AFF;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10002;
      box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
      animation: prompt-generator-fade-in 0.3s ease;
      cursor: pointer;
    ">
      🎯 选择模式激活 - 点击任意元素或按ESC退出
    </div>
  `;
  
  // 点击指示器也可以退出选择模式
  indicator.addEventListener('click', exitSelectionMode);
  
  // 添加CSS动画
  if (!document.getElementById('prompt-generator-styles')) {
    const styles = document.createElement('style');
    styles.id = 'prompt-generator-styles';
    styles.textContent = `
      @keyframes prompt-generator-fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(indicator);
}

// 隐藏模式指示器
function hideModeIndicator() {
  const existing = document.getElementById('prompt-generator-indicator');
  if (existing) {
    existing.remove();
  }
}

// ESC键退出选择模式
function handleKeyDown(event) {
  if (event.key === 'Escape' && isSelectionMode) {
    exitSelectionMode();
  }
}

// 监听来自background script或sidepanel的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Prompt Generator] Received message:', message);
  
  switch (message.action) {
    case 'enterSelectionMode':
      enterSelectionMode();
      sendResponse({ success: true });
      break;
      
    case 'exitSelectionMode':
      exitSelectionMode();
      sendResponse({ success: true });
      break;
      
    case 'getPageInfo':
      // 返回基本页面信息
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname
        }
      });
      break;
      
    case 'getCurrentPageData':
      // 返回详细的页面数据（用于页面分析功能）
      try {
        const pageData = extractPageData();
        sendResponse({
          success: true,
          data: pageData
        });
      } catch (error) {
        console.error('[Prompt Generator] Error extracting page data:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      }
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
      break;
  }
  
  return true; // 保持消息通道开放
});

// 添加全局键盘监听
document.addEventListener('keydown', handleKeyDown);

// 页面加载完成时的初始化
if (document.readyState === 'complete') {
  console.log('[Prompt Generator] Page already loaded, ready for element selection');
} else {
  window.addEventListener('load', () => {
    console.log('[Prompt Generator] Page loaded, ready for element selection');
  });
}

// 清理函数，在页面卸载时调用
window.addEventListener('beforeunload', () => {
  exitSelectionMode();
});