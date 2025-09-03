def fix_useauth_import():
    """修复ChatInterface中缺失的useAuth导入"""
    
    try:
        # 读取文件
        with open('../src/components/ChatInterface.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有useAuth导入
        if 'import { useAuth }' in content:
            print("✅ useAuth导入已存在")
            return True
        
        # 在第37行后添加useAuth导入
        lines = content.split('\n')
        
        # 找到存储相关导入的位置（第37行附近）
        insert_index = -1
        for i, line in enumerate(lines):
            if 'from "@/lib/storage";' in line:
                insert_index = i + 1
                break
        
        if insert_index > 0:
            # 添加useAuth和api导入
            lines.insert(insert_index, 'import { useAuth } from "@/lib/auth";')
            lines.insert(insert_index + 1, 'import { api } from "@/lib/api";')
            
            # 重新组合内容
            content = '\n'.join(lines)
            
            # 写回文件
            with open('../src/components/ChatInterface.tsx', 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("✅ 成功添加useAuth导入")
            return True
        else:
            print("❌ 未找到插入位置")
            return False
            
    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False

if __name__ == "__main__":
    fix_useauth_import()
