import re

def fix_chat_interface():
    """修复ChatInterface组件，让它从服务器获取对话列表"""
    
    try:
        # 读取ChatInterface文件
        with open('../src/components/ChatInterface.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有从API获取对话的逻辑
        if 'api.getConversations' in content:
            print("✅ ChatInterface已经包含API获取对话的逻辑")
            return True
        
        # 查找useEffect部分并添加获取对话的逻辑
        # 找到import部分，添加useAuth和api的导入
        if 'import { useAuth }' not in content:
            # 查找导入语句的位置
            import_pattern = r'(import.*from.*[\'"]\.\./lib/.*[\'"];?\s*\n)'
            
            # 添加useAuth导入
            auth_import = "import { useAuth } from '../lib/auth';\n"
            api_import = "import { api } from '../lib/api';\n"
            
            content = re.sub(import_pattern, r'\1' + auth_import + api_import, content, count=1)
        
        # 在组件开始添加useAuth
        component_start = r'export function ChatInterface\(\) \{\s*\n\s*const \{ t, language \} = useTranslation\(\);'
        replacement = '''export function ChatInterface() {
  const { t, language } = useTranslation();
  const { user } = useAuth();'''
        
        content = re.sub(component_start, replacement, content)
        
        # 添加从服务器加载对话的useEffect
        useeffect_pattern = r'(// 监听语言变化，更新默认对话\s*\n\s*useEffect.*?\n.*?\}, \[language, t\];)'
        
        new_useeffect = '''// 监听语言变化，更新默认对话
  useEffect(() => {
    if (language) {
      const defaultConversations = getDefaultConversations(t);
      setConversations(prev => {
        if (prev.length === 0 || (prev.length === 1 && prev[0].id === "1")) {
          return defaultConversations;
        }
        return prev;
      });
    }
  }, [language, t]);

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
  }, [user, t]);'''
        
        content = re.sub(useeffect_pattern, new_useeffect, content, flags=re.DOTALL)
        
        # 写回文件
        with open('../src/components/ChatInterface.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 成功修复ChatInterface - 现在会从服务器获取用户对话")
        return True
        
    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False

if __name__ == "__main__":
    fix_chat_interface()
