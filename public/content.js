// content.js - 内容脚本，运行在每个网页上
console.log('[PRD For AI] Content script loaded');

// 提取页面信息的主函数
function extractPageData() {
  console.log('[PRD For AI] Extracting page data...');
  
  try {
    const pageData = {
      // 基本页面信息
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      
      // HTML源代码
      htmlSource: document.documentElement.outerHTML,
      
      // 页面文本内容
      textContent: extractTextContent(),
      
      // CSS样式信息
      styles: extractStyles(),
      
      // 字体信息
      fonts: extractFonts(),
      
      // 页面元数据
      metadata: extractMetadata(),
      
      // 页面尺寸信息
      dimensions: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      },
      
      // 提取时间
      extractedAt: new Date().toISOString()
    };
    
    console.log('[PRD For AI] Page data extracted successfully');
    return pageData;
  } catch (error) {
    console.error('[PRD For AI] Error extracting page data:', error);
    return {
      error: error.message,
      url: window.location.href,
      title: document.title || 'Unknown',
      extractedAt: new Date().toISOString()
    };
  }
}

// 提取页面文本内容
function extractTextContent() {
  // 移除脚本和样式标签的内容
  const clone = document.cloneNode(true);
  const scripts = clone.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());
  
  return {
    fullText: clone.body ? clone.body.innerText : '',
    headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ tag: h.tagName.toLowerCase(), text: h.textContent.trim() })),
    paragraphs: Array.from(document.querySelectorAll('p'))
      .map(p => p.textContent.trim()).filter(text => text.length > 0),
    links: Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({ text: a.textContent.trim(), href: a.href }))
  };
}

// 提取CSS样式
function extractStyles() {
  const styles = {
    inlineStyles: [],
    externalStylesheets: [],
    computedStyles: {},
    cssVariables: {}
  };
  
  try {
    // 获取外部样式表
    Array.from(document.styleSheets).forEach((stylesheet, index) => {
      try {
        if (stylesheet.href) {
          styles.externalStylesheets.push({
            href: stylesheet.href,
            title: stylesheet.title || `Stylesheet ${index + 1}`
          });
        }
        
        // 尝试获取CSS规则（可能因CORS被阻止）
        if (stylesheet.cssRules) {
          const rules = Array.from(stylesheet.cssRules).map(rule => rule.cssText);
          if (stylesheet.href) {
            styles.externalStylesheets[styles.externalStylesheets.length - 1].rules = rules;
          } else {
            styles.inlineStyles.push(...rules);
          }
        }
      } catch (e) {
        console.log('[PRD For AI] Cannot access stylesheet due to CORS:', e.message);
      }
    });
    
    // 获取内联样式
    Array.from(document.querySelectorAll('[style]')).forEach(element => {
      if (element.style.cssText) {
        styles.inlineStyles.push({
          element: element.tagName.toLowerCase(),
          style: element.style.cssText
        });
      }
    });
    
    // 获取计算样式（主要元素）
    const mainElements = document.querySelectorAll('body, main, header, nav, footer, section, article');
    mainElements.forEach(element => {
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const elementStyles = {};
        
        // 只收集重要的样式属性
        const importantProps = [
          'font-family', 'font-size', 'font-weight', 'color', 'background-color',
          'background-image', 'padding', 'margin', 'border', 'width', 'height',
          'display', 'position', 'flex', 'grid'
        ];
        
        importantProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value) elementStyles[prop] = value;
        });
        
        styles.computedStyles[element.tagName.toLowerCase()] = elementStyles;
      }
    });
    
    // 获取CSS变量
    const rootStyle = window.getComputedStyle(document.documentElement);
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      if (prop.startsWith('--')) {
        styles.cssVariables[prop] = rootStyle.getPropertyValue(prop);
      }
    }
    
  } catch (error) {
    console.error('[PRD For AI] Error extracting styles:', error);
    styles.error = error.message;
  }
  
  return styles;
}

// 提取字体信息
function extractFonts() {
  const fonts = {
    used: new Set(),
    available: [],
    webFonts: [],
    fontResources: [],
    summary: {}
  };
  
  try {
    // 检查所有元素的字体使用
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const fontFamily = style.getPropertyValue('font-family');
      if (fontFamily) {
        fonts.used.add(fontFamily);
      }
    });
    
    // 转换Set为Array
    fonts.used = Array.from(fonts.used);
    
    // 检查Web字体加载
    if (document.fonts) {
      document.fonts.forEach(font => {
        fonts.webFonts.push({
          family: font.family,
          style: font.style,
          weight: font.weight,
          status: font.status
        });
      });
    }
    
    // 获取字体资源的网络信息
    const fontResources = [];
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      
      resources.forEach(resource => {
        // 检查是否为字体文件
        const url = resource.name;
        const isFontResource = 
          /\.(woff2|woff|ttf|otf|eot)(\?|$)/i.test(url) ||
          resource.initiatorType === 'font' ||
          (resource.responseType && resource.responseType.includes('font'));
        
        if (isFontResource) {
          // 提取文件格式
          const urlObj = new URL(url);
          const pathname = urlObj.pathname.toLowerCase();
          let format = 'unknown';
          if (pathname.includes('.woff2')) format = 'woff2';
          else if (pathname.includes('.woff')) format = 'woff';
          else if (pathname.includes('.ttf')) format = 'truetype';
          else if (pathname.includes('.otf')) format = 'opentype';
          else if (pathname.includes('.eot')) format = 'embedded-opentype';
          
          // 提取文件名
          const filename = pathname.split('/').pop() || url.split('/').pop();
          
          fontResources.push({
            name: filename,
            url: url,
            domain: urlObj.hostname,
            format: format,
            size: resource.transferSize || resource.encodedBodySize || 0,
            loadTime: resource.duration || 0,
            status: resource.responseStatus || (resource.transferSize > 0 ? 200 : 'unknown'),
            initiatorType: resource.initiatorType,
            startTime: resource.startTime,
            responseStart: resource.responseStart,
            responseEnd: resource.responseEnd
          });
        }
      });
    }
    
    fonts.fontResources = fontResources;
    
    // 获取@font-face声明
    Array.from(document.styleSheets).forEach(stylesheet => {
      try {
        if (stylesheet.cssRules) {
          Array.from(stylesheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const fontFace = {
                cssText: rule.cssText,
                family: rule.style.getPropertyValue('font-family').replace(/['"]/g, ''),
                src: rule.style.getPropertyValue('src'),
                weight: rule.style.getPropertyValue('font-weight') || 'normal',
                style: rule.style.getPropertyValue('font-style') || 'normal',
                display: rule.style.getPropertyValue('font-display') || 'auto'
              };
              
              // 解析src中的字体URL和格式
              if (fontFace.src) {
                const srcMatches = fontFace.src.match(/url\(['"]?([^'"()]+)['"]?\)(\s+format\(['"]?([^'"()]+)['"]?\))?/g);
                if (srcMatches) {
                  fontFace.sources = srcMatches.map(match => {
                    const urlMatch = match.match(/url\(['"]?([^'"()]+)['"]?\)/);
                    const formatMatch = match.match(/format\(['"]?([^'"()]+)['"]?\)/);
                    return {
                      url: urlMatch ? urlMatch[1] : '',
                      format: formatMatch ? formatMatch[1] : 'unknown'
                    };
                  });
                }
              }
              
              fonts.webFonts.push(fontFace);
            }
          });
        }
      } catch (e) {
        // CORS错误，忽略
        console.log('[PRD For AI] Cannot access stylesheet for font-face rules:', e.message);
      }
    });
    
    // 生成字体使用总结
    fonts.summary = {
      totalUsedFonts: fonts.used.length,
      totalWebFonts: fonts.webFonts.length,
      totalFontResources: fonts.fontResources.length,
      totalFontSize: fonts.fontResources.reduce((sum, font) => sum + font.size, 0),
      fontFormats: [...new Set(fonts.fontResources.map(f => f.format))],
      fontDomains: [...new Set(fonts.fontResources.map(f => f.domain))]
    };
    
  } catch (error) {
    console.error('[PRD For AI] Error extracting fonts:', error);
    fonts.error = error.message;
  }
  
  return fonts;
}

// 提取页面元数据
function extractMetadata() {
  const metadata = {
    meta: {},
    openGraph: {},
    twitter: {},
    jsonLd: []
  };
  
  try {
    // 标准meta标签
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        if (name.startsWith('og:')) {
          metadata.openGraph[name] = content;
        } else if (name.startsWith('twitter:')) {
          metadata.twitter[name] = content;
        } else {
          metadata.meta[name] = content;
        }
      }
    });
    
    // JSON-LD结构化数据
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        metadata.jsonLd.push(JSON.parse(script.textContent));
      } catch (e) {
        console.log('[PRD For AI] Error parsing JSON-LD:', e);
      }
    });
    
  } catch (error) {
    console.error('[PRD For AI] Error extracting metadata:', error);
    metadata.error = error.message;
  }
  
  return metadata;
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[PRD For AI] Received message:', message);
  
  if (message.action === 'extractPageData') {
    const pageData = extractPageData();
    sendResponse(pageData);
  }
  
  return true; // 保持消息通道开放用于异步响应
});

// 页面加载完成时自动提取一次数据并存储
if (document.readyState === 'complete') {
  console.log('[PRD For AI] Page already loaded, extracting data...');
  setTimeout(() => {
    const pageData = extractPageData();
    // 将数据存储到会话存储，供侧边栏使用
    sessionStorage.setItem('prdForAI_pageData', JSON.stringify(pageData));
  }, 1000);
} else {
  window.addEventListener('load', () => {
    console.log('[PRD For AI] Page loaded, extracting data...');
    setTimeout(() => {
      const pageData = extractPageData();
      sessionStorage.setItem('prdForAI_pageData', JSON.stringify(pageData));
    }, 1000);
  });
}