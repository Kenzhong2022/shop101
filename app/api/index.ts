/**
 * API请求统一管理
 * 所有API请求都通过这里导出
 */

// 导入二次封装的请求工具
import { http, default as request } from '../utils/request'

// 导出二次封装的请求工具
export { http, default } from '../utils/request'

// 导出认证相关API
export * from './auth'

// 可以在这里添加其他API模块
// export * from './user'
// export * from './product'
// export * from './order'