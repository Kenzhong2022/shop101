/**
 * Axios 类型声明文件
 * 
 * 作用：为 Nuxt 应用中的全局 $axios 实例提供 TypeScript 类型定义
 * 
 * 必要性：
 * 1. 实现类型安全：确保在使用 $axios 实例时获得完整的 TypeScript 类型检查和智能提示
 * 2. 提供 IDE 支持：使开发者在编码过程中获得自动补全和类型错误提示
 * 3. 增强代码可读性：明确 $axios 实例的使用方式和可用方法
 * 4. 统一接口约定：确保所有组件和服务中对 $axios 的使用保持一致
 * 
 * 实现机制：
 * - 通过 TypeScript 的模块扩展功能扩展了 NuxtApp 接口
 * - 通过模块声明扩展了 Vue 的 ComponentCustomProperties 接口
 * - 引入并使用 AxiosInstance 类型定义 $axios 的具体类型
 * 
 * 使用效果：
 * - 在 Composition API 中可通过 useNuxtApp().$axios 获取类型化的 axios 实例
 * - 在 Options API 中可直接使用 this.$axios 并获得完整类型支持
 * - 所有 axios 标准方法（get、post、put、delete 等）都获得类型提示
 * - 请求和响应的类型也能通过泛型参数进行指定
 */
// types/axios.d.ts
import type { AxiosInstance } from "axios";

declare module "#app" {
  interface NuxtApp {
    $axios: AxiosInstance;
  }
}

// 如果你还在 Options API 里用 this.$axios，再补一份
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}
