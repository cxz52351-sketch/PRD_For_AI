#!/bin/bash

echo "=== 163邮箱SMTP配置向导 ==="
echo ""
echo "请按照以下步骤配置163邮箱："
echo ""
echo "1. 登录163邮箱网页版 (mail.163.com)"
echo "2. 点击右上角'设置' -> 'POP3/SMTP/IMAP'"
echo "3. 开启 'SMTP服务'"
echo "4. 点击'获取授权码'，按提示操作"
echo "5. 记住获得的授权码(不是密码!)"
echo ""

read -p "请输入您的163邮箱地址: " email
read -p "请输入您的163邮箱授权码: " auth_code

# 更新.env文件
sed -i.bak "s/SMTP_USERNAME=.*/SMTP_USERNAME=${email}/" .env
sed -i.bak "s/SMTP_PASSWORD=.*/SMTP_PASSWORD=${auth_code}/" .env

echo ""
echo "✅ 邮箱配置已更新!"
echo "邮箱: ${email}"
echo "授权码: ${auth_code}"
echo ""
echo "现在可以重启后端服务器测试邮件发送功能。"