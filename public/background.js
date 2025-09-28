// background.js - 后台脚本，管理插件的通信和状态
console.log('[PRD For AI] Background script loaded');

// 插件安装或启动时
chrome.runtime.onInstalled.addListener(() => {
  console.log('[PRD For AI] Extension installed/updated');
});

// 处理来自sidepanel和content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Prompt Generator] Background received message:', message);
  
  // 处理来自sidepanel的消息
  if (message.action === 'getCurrentPageData') {
    getCurrentPageData().then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in getCurrentPageData:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'enterSelectionMode') {
    enterSelectionMode().then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in enterSelectionMode:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'exitSelectionMode') {
    exitSelectionMode().then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in exitSelectionMode:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'captureTab') {
    captureCurrentTab().then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in captureTab:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'captureElementScreenshot') {
    captureElementScreenshot(message.elementData).then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in captureElementScreenshot:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'injectContentScript') {
    injectContentScript(message.tabId).then(sendResponse).catch(err => {
      console.error('[Prompt Generator] Error in injectContentScript:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  // 处理来自content script的消息（元素选择）
  if (message.type === 'ELEMENT_SELECTED') {
    // 将消息转发给所有sidepanel
    notifySidepanel(message);
    sendResponse({ success: true });
    return true;
  }
});

// 进入选择模式
async function enterSelectionMode() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    if (!canInjectScript(activeTab.url)) {
      throw new Error('Cannot enter selection mode on this type of page');
    }
    
    // 发送消息给content script进入选择模式
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'enterSelectionMode' 
      });
      
      if (response && response.success) {
        console.log('[Prompt Generator] Selection mode activated');
        return { success: true };
      }
    } catch (contentError) {
      console.log('[Prompt Generator] Content script not available, injecting...');
      
      // 注入content script
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js']
      });
      
      // 等待初始化
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 再次尝试
      const response = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'enterSelectionMode' 
      });
      
      if (response && response.success) {
        console.log('[Prompt Generator] Selection mode activated after injection');
        return { success: true };
      }
    }
    
    throw new Error('Failed to enter selection mode');
    
  } catch (error) {
    console.error('[Prompt Generator] Error entering selection mode:', error);
    return { success: false, error: error.message };
  }
}

// 退出选择模式  
async function exitSelectionMode() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    if (!canInjectScript(activeTab.url)) {
      return { success: true }; // 如果无法注入脚本，就认为成功退出
    }
    
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'exitSelectionMode' 
      });
      
      if (response && response.success) {
        console.log('[Prompt Generator] Selection mode deactivated');
        return { success: true };
      }
    } catch (contentError) {
      console.log('[Prompt Generator] Content script not available for exit');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('[Prompt Generator] Error exiting selection mode:', error);
    return { success: false, error: error.message };
  }
}

// 通知sidepanel
async function notifySidepanel(message) {
  try {
    // Chrome扩展API限制，我们无法直接给sidepanel发消息
    // 所以我们将数据存储到storage中，让sidepanel轮询获取
    await chrome.storage.session.set({ 
      'elementSelectedData': message.data,
      'elementSelectedTimestamp': Date.now()
    });
    
    console.log('[Prompt Generator] Element data stored for sidepanel');
  } catch (error) {
    console.error('[Prompt Generator] Error storing element data:', error);
  }
}
async function getCurrentPageData() {
  try {
    // 获取当前活动标签
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    console.log('[PRD For AI] Getting data from tab:', activeTab.url);
    
    // 检查URL是否可以注入脚本
    if (!canInjectScript(activeTab.url)) {
      console.log('[PRD For AI] Cannot inject script to this page, using basic tab info');
      const basicData = {
        url: activeTab.url,
        title: activeTab.title,
        domain: extractDomain(activeTab.url),
        favicon: activeTab.favIconUrl,
        extractedAt: new Date().toISOString(),
        source: 'tab_api',
        error: 'Cannot access page content on this type of page'
      };
      return { success: true, data: basicData };
    }
    
    // 首先尝试向content script发送消息获取数据
    try {
      const pageData = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'extractPageData' 
      });
      
      if (pageData && !pageData.error) {
        console.log('[PRD For AI] Page data received from content script');
        return { success: true, data: pageData };
      }
    } catch (contentError) {
      console.log('[PRD For AI] Content script not available, injecting...', contentError.message);
    }
    
    // 如果content script不可用，则注入它
    try {
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js']
      });
      
      console.log('[PRD For AI] Content script injected, waiting for initialization...');
      
      // 等待一下让content script初始化
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 再次尝试获取数据
      const pageData = await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'extractPageData' 
      });
      
      if (pageData && !pageData.error) {
        console.log('[PRD For AI] Page data received after injection');
        return { success: true, data: pageData };
      }
    } catch (injectionError) {
      console.error('[PRD For AI] Failed to inject content script:', injectionError);
    }
    
    // 如果无法通过content script获取数据，使用基本的tab信息
    const basicData = {
      url: activeTab.url,
      title: activeTab.title,
      domain: extractDomain(activeTab.url),
      favicon: activeTab.favIconUrl,
      extractedAt: new Date().toISOString(),
      source: 'tab_api',
      error: 'Could not extract detailed page content'
    };
    
    console.log('[PRD For AI] Returning basic tab data');
    return { success: true, data: basicData };
    
  } catch (error) {
    console.error('[PRD For AI] Error getting current page data:', error);
    return { 
      success: false, 
      error: error.message,
      data: {
        error: error.message,
        extractedAt: new Date().toISOString()
      }
    };
  }
}

// 截取当前标签页
async function captureCurrentTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    // 截取可见区域
    const dataUrl = await chrome.tabs.captureVisibleTab(activeTab.windowId, {
      format: 'png',
      quality: 90
    });
    
    console.log('[PRD For AI] Tab screenshot captured');
    return { success: true, screenshot: dataUrl };
    
  } catch (error) {
    console.error('[PRD For AI] Error capturing tab:', error);
    return { success: false, error: error.message };
  }
}

// 截取元素图片
async function captureElementScreenshot(elementData) {
  try {
    console.log('[Background] 开始截图，元素数据:', elementData);

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) {
      throw new Error('无法获取当前标签页');
    }

    // 截取整个可见区域
    const fullScreenshot = await chrome.tabs.captureVisibleTab(tabs[0].windowId, {
      format: 'png',
      quality: 100
    });

    console.log('[Background] 全屏截图完成，开始裁剪元素区域');

    // 获取元素位置信息
    const element = elementData.element || elementData;
    const rect = element.rect || element.dimensions;

    if (!rect) {
      console.warn('[Background] 缺少元素位置信息，返回全屏截图');
      return { success: true, screenshot: fullScreenshot };
    }

    // 创建一个离屏Canvas进行图片处理
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    
    // 创建图片对象
    const response = await fetch(fullScreenshot);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // 获取设备像素比
    const devicePixelRatio = 2; // 默认值，可以根据需要调整

    // 计算实际截图尺寸
    const actualX = Math.max(0, rect.x * devicePixelRatio);
    const actualY = Math.max(0, rect.y * devicePixelRatio);
    const actualWidth = Math.min(bitmap.width - actualX, rect.width * devicePixelRatio);
    const actualHeight = Math.min(bitmap.height - actualY, rect.height * devicePixelRatio);

    console.log('[Background] 裁剪参数:', { 
      originalRect: rect, 
      devicePixelRatio, 
      actualX, actualY, actualWidth, actualHeight,
      bitmapSize: { width: bitmap.width, height: bitmap.height }
    });

    // 设置Canvas尺寸
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    // 裁剪元素区域
    ctx.drawImage(
      bitmap,
      actualX, actualY, actualWidth, actualHeight,  // 源区域
      0, 0, actualWidth, actualHeight                // 目标区域
    );

    // 转换为Blob然后转为DataURL
    const croppedBlob = await canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = () => {
        const croppedDataUrl = reader.result;
        console.log('[Background] 元素截图完成，大小:', croppedDataUrl.length);
        resolve({ success: true, screenshot: croppedDataUrl });
      };
      reader.readAsDataURL(croppedBlob);
    });

  } catch (error) {
    console.error('[Background] 截图失败:', error);
    return { success: false, error: error.message };
  }
}

// 注入content script
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    console.log('[PRD For AI] Content script injected successfully');
    return { success: true };
  } catch (error) {
    console.error('[PRD For AI] Error injecting content script:', error);
    return { success: false, error: error.message };
  }
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[PRD For AI] Tab updated:', tab.url);
  }
});

// 监听标签页切换
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('[PRD For AI] Tab activated:', activeInfo.tabId);
});

// 工具函数：检查URL是否可以注入脚本
function canInjectScript(url) {
  if (!url) return false;
  
  const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'about:'];
  const restrictedDomains = ['chrome.google.com', 'chromewebstore.google.com'];
  
  try {
    // 检查协议
    if (restrictedProtocols.some(protocol => url.startsWith(protocol))) {
      return false;
    }
    
    const urlObj = new URL(url);
    
    // 检查域名
    if (restrictedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// 工具函数：提取域名
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return 'unknown';
  }
}