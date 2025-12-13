// plugins/directive-debounce.js
import { defineNuxtPlugin } from "#app"; // Nuxt 3 内置的插件定义函数
import vDebounce from "@/directives/vDebounce"; // 导入防抖指令逻辑

// 定义 Nuxt 插件
export default defineNuxtPlugin((nuxtApp) => {
  // 通过 nuxtApp.vueApp 获取 Vue 应用实例（等价于 Vue 3 的 createApp() 返回的 app）
  nuxtApp.vueApp.directive("debounce", vDebounce);
});
