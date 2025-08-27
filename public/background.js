// background.js - 后台脚本，管理插件的通信和状态
console.log('[PRD For AI] Background script loaded');

// 插件安装或启动时
chrome.runtime.onInstalled.addListener(() => {
  console.log('[PRD For AI] Extension installed/updated');
});

// 处理来自sidepanel的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[PRD For AI] Background received message:', message);
  
  if (message.action === 'getCurrentPageData') {
    getCurrentPageData().then(sendResponse).catch(err => {
      console.error('[PRD For AI] Error in getCurrentPageData:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'captureTab') {
    captureCurrentTab().then(sendResponse).catch(err => {
      console.error('[PRD For AI] Error in captureTab:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'injectContentScript') {
    injectContentScript(message.tabId).then(sendResponse).catch(err => {
      console.error('[PRD For AI] Error in injectContentScript:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // 异步响应
  }
});

// 获取当前页面数据
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