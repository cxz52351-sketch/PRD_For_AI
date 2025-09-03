def complete_fix_chatinterface():
    """完整修复ChatInterface，添加从服务器获取对话的逻辑"""
    
    try:
        # 读取文件
        with open('../src/components/ChatInterface.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有用户对话加载逻辑
        if 'loadUserConversations' in content:
            print("✅ 用户对话加载逻辑已存在")
            return True
        
        # 在现有的useEffect后添加新的用户对话加载逻辑
        # 找到第一个useEffect结束的位置
        useeffect_end_pattern = r'}, \[language, t\];\);'
        
        # 要添加的新useEffect
        new_useeffect = '''
  
  // 用户登录后从服务器获取对话列表
  useEffect(() => {
    const loadUserConversations = async () => {
      if (user) {
        try {
          console.log('🔄 用户已登录，从服务器加载对话列表...');
          const response = await api.getConversations(100, 0); // 获取100个对话
          const serverConversations = response.conversations;
          
          if (serverConversations && serverConversations.length > 0) {
            // 转换服务器对话格式为前端格式
            const convertedConversations = serverConversations.map(conv => ({
              id: conv.id,
              title: conv.title,
              timestamp: new Date(conv.updated_at),
              preview: conv.title,
              messages: [] // 消息会在点击时加载
            }));
            
            console.log(`✅ 从服务器加载了 ${convertedConversations.length} 个对话`);
            setConversations(convertedConversations);
            
            // 如果当前没有活跃对话或活跃对话不存在，设置第一个对话为活跃
            const firstConversationId = convertedConversations[0]?.id;
            if (firstConversationId && (!activeConversationId || !convertedConversations.some(c => c.id === activeConversationId))) {
              setActiveConversationId(firstConversationId);
            }
          } else {
            console.log('📝 用户暂无对话记录，使用默认对话');
            setConversations(getDefaultConversations(t));
          }
        } catch (error) {
          console.error('❌ 加载用户对话失败:', error);
          // 如果加载失败，使用默认对话
          setConversations(getDefaultConversations(t));
        }
      } else {
        console.log('👤 用户未登录，使用默认对话');
        setConversations(getDefaultConversations(t));
      }
    };

    loadUserConversations();
  }, [user, t, activeConversationId]);'''
        
        # 在第一个useEffect后插入新的useEffect
        import re
        content = re.sub(useeffect_end_pattern, r'}, [language, t]);' + new_useeffect, content)
        
        # 写回文件
        with open('../src/components/ChatInterface.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 成功添加用户对话加载逻辑")
        return True
        
    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False

if __name__ == "__main__":
    complete_fix_chatinterface()
