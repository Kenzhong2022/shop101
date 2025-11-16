/**
 * API请求统一管理
 * 所有API请求都通过这里导出
 */

// 导出认证相关API
export * from "./auth";
export * from "./Friends-api";
// 可以在这里添加其他API模块
// export * from './user'
// export * from './product'
// export * from './order'

/**
 * 注意：现在API实现已改为使用axios插件
 * 不再需要导出request工具，所有API直接通过此文件统一导出
 * axios实例通过Nuxt依赖注入系统使用useNuxtApp().$axios获取
 */
