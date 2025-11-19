/**
 * 自定义 Element Plus 消息提示（JavaScript 版本）
 * 兼容 Nuxt 3 的插件系统
 * 
 * @使用说明
 * 
 * 1. 组合式 API 使用方法：
 *    ```javascript
 *    // 在 setup() 或 <script setup> 中使用
 *    const { $message } = useNuxtApp()
 *    
 *    // 显示成功消息
 *    $message.success('操作成功！')
 *    
 *    // 显示错误消息
 *    $message.error('操作失败！')
 *    
 *    // 显示警告消息
 *    $message.warning('请注意！')
 *    
 *    // 显示普通消息（自定义配置）
 *    $message({
 *      message: '自定义消息',
 *      type: 'info',
 *      duration: 3000,  // 3秒后自动关闭
 *      center: true     // 居中显示
 *    })
 *    ```
 * 
 * 2. 选项式 API 使用方法：
 *    ```javascript
 *    // 在 methods 中使用
 *    this.$message.success('操作成功！')
 *    this.$message.error('操作失败！')
 *    this.$message.warning('请注意！')
 *    ```
 * 
 * 3. 特性说明：
 *    - 单例模式：新消息会自动关闭之前的消息
 *    - 默认居中显示，持续2秒
 *    - 支持所有 Element Plus ElMessage 的配置选项
 *    - 客户端专用（.client.js 后缀避免 SSR 报错）
 * 
 * 4. 与直接使用 ElMessage 的区别：
 *    - 自动单例管理，避免消息堆叠
 *    - 统一配置（居中、时长等）
 *    - 更好的 Nuxt 3 集成
 */

import { ElMessage } from "element-plus";

export default defineNuxtPlugin(() => {
  /**
   * 封装单例 ElMessage 方法
   * 确保同一时间只显示一个消息提示
   * @param {Object} options - 消息配置选项
   * @returns {Object} ElMessage 实例
   */
  const singleElMessage = (options) => {
    // 显示新提示前，关闭所有已存在的 ElMessage（单例核心）
    ElMessage.closeAll();
    
    return ElMessage({
      ...options,
      duration: options.duration || 2000, // 默认 2s 关闭
      center: options.center !== false, // 默认居中（除非明确设置为 false）
    });
  };

  /**
   * 快捷方法集合
   * 提供常用的消息类型快捷调用
   */
  const messageShortcuts = {
    // 警告提示 - 用于提醒用户注意
    warning: (msg) => singleElMessage({ 
      message: msg, 
      type: "warning" 
    }),
    
    // 成功提示 - 用于显示操作成功
    success: (msg) => singleElMessage({ 
      message: msg, 
      type: "success" 
    }),
    
    // 错误提示 - 用于显示操作失败
    error: (msg) => singleElMessage({ 
      message: msg, 
      type: "error" 
    }),
  };

  /**
   * 合并核心方法 + 快捷方法
   * 支持两种调用方式：
   * 1. $message('消息内容') - 简写形式
   * 2. $message.success('消息内容') - 快捷方法
   */
  const message = { ...singleElMessage, ...messageShortcuts };
  
  /**
   * 注入到 Nuxt 应用
   * 通过 provide 机制，使所有组件都能访问 $message
   */
  return {
    provide: {
      message
    }
  };
});
