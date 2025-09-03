def fix_duplicate_api_import():
    """移除重复的api导入"""
    
    try:
        # 读取文件
        with open('../src/components/ChatInterface.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 移除重复的api导入行
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            # 跳过单独的api导入行，保留已有的完整导入
            if line.strip() == 'import { api } from "@/lib/api";':
                print(f"移除重复导入: {line}")
                continue
            new_lines.append(line)
        
        # 重新组合内容
        content = '\n'.join(new_lines)
        
        # 写回文件
        with open('../src/components/ChatInterface.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 成功移除重复的api导入")
        return True
        
    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False

if __name__ == "__main__":
    fix_duplicate_api_import()
