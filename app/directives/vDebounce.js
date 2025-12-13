// 导入防抖组合式函数（复用之前的逻辑）
import { useDebounce } from "@/composables/tools";

// 全局指令的核心逻辑（和之前局部指令逻辑一致，新增清理逻辑）
export default {
  // 组件挂载时绑定事件（Vue 3 推荐用 mounted 钩子）
  mounted(el, binding) {
    // 1. 校验绑定值：必须是函数（否则报错提示）
    if (typeof binding.value !== "function") {
      console.error("[v-debounce] 绑定值必须是函数！");
      return;
    }
    // v-debounce:[800] 指令参数：防抖延迟时间（毫秒）
    // 2. 获取指令参数（防抖延迟）和绑定值（回调函数）
    const delay = binding.arg || 500; // 默认 500ms
    const callback = binding.value;

    // 3. 生成防抖函数
    const debouncedFn = useDebounce(callback, delay);

    // 4. 绑定点击事件（触发防抖函数）
    el.addEventListener("click", debouncedFn);

    // 5. 存储防抖函数和清理逻辑到 DOM 元素（用于卸载时清理）
    el._debouncedFn = debouncedFn;
    el._cleanupDebounce = () => {
      el.removeEventListener("click", debouncedFn);
      el._debouncedFn = null; // 释放内存
      el._cleanupDebounce = null;
    };
  },

  // 组件卸载时自动清理（Vue 3 钩子，无需手动在组件内写 onUnmounted）
  unmounted(el) {
    // 执行清理逻辑，避免内存泄漏
    el._cleanupDebounce?.();
  },
};
