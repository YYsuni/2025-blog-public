// src/components/WalineComments.jsx
'use client';
import { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';

export default function WalineComments({ path }) {
  const walineInstanceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // 销毁之前的实例
    if (walineInstanceRef.current) {
      walineInstanceRef.current.destroy();
    }

    // 初始化 Waline
    walineInstanceRef.current = init({
      el: containerRef.current,
      serverURL: 'https://waline-blog-t0tez5p1e-badragon.vercel.app/', // 您的 Waline 服务地址
      path: path || window.location.pathname, // 文章路径
      lang: 'zh-CN', // 语言
      dark: 'auto', // 暗色模式跟随系统
      reaction: false, // 启用表情反应
      search: false, // 禁用搜索（简化版）
      login: 'disable', // 完全禁用登录，纯匿名评论
      
      // 匿名评论配置
      anonymous: true, // 允许匿名评论
      requiredMeta: ['nick', 'mail'], // 必填字段：昵称和邮箱
      
      // 自定义配置
      placeholder: '欢迎留言！支持 Markdown 语法哦~',
      avatar: 'mp', // 头像生成方式
      meta: ['nick', 'mail', 'link'], // 显示的表单字段
      pageSize: 10, // 每页评论数
    });

    return () => {
      if (walineInstanceRef.current) {
        walineInstanceRef.current.destroy();
      }
    };
  }, [path]); // 路径变化时重新初始化

  return (
    <div className="waline-comments mt-12 pt-8 border-t">
      <div ref={containerRef} />
    </div>
  );
}
