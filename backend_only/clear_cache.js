// 清理前端缓存脚本
console.log('🧹 开始清理前端缓存...');

// 1. 清理所有本地存储
localStorage.clear();
sessionStorage.clear();
console.log('✅ 已清理 localStorage 和 sessionStorage');

// 2. 清理所有 Cookie (如果有的话)
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ 已清理 Cookies');

// 3. 显示清理完成信息
console.log('🎯 缓存清理完成！请重新登录测试用户隔离功能');
console.log('📝 测试步骤:');
console.log('   1. 用管理员账号 (490429443@qq.com) 登录 -> 应该看到125个对话');
console.log('   2. 注销后用其他测试账号登录 -> 应该看到0个对话');
console.log('   3. 创建新对话 -> 应该只属于当前登录用户');

// 3秒后自动刷新页面
setTimeout(() => {
    console.log('🔄 3秒后自动刷新页面...');
    location.reload();
}, 3000);
