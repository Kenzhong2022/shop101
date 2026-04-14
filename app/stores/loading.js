// stores/loading.js
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useLoadingStore = defineStore("loading", () => {
  // 请求计数器
  const requestCount = ref(0);
  // 是否显示 loading（响应式）
  const isLoading = ref(false);
  // 延迟显示 loading 的定时器
  let delayTimer = null;

  // 延迟显示时间（毫秒），可根据业务调整
  const DELAY_MS = 20;

  // 更新 isLoading 的真实值
  function updateLoadingState() {
    // 如果有定时器在等待，先清除
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }

    const shouldShow = requestCount.value > 0;
    if (shouldShow) {
      // 延迟显示，避免短时间请求闪烁
      delayTimer = setTimeout(() => {
        // console.log("isLoading", isLoading);
        isLoading.value = true;
      }, DELAY_MS);
    } else {
      // 无请求时立即隐藏
      // console.log("isLoading", isLoading);
      isLoading.value = false;
    }
  }

  // 开始请求
  function startLoading() {
    requestCount.value++;
    updateLoadingState();
  }

  // 结束请求
  function stopLoading() {
    if (requestCount.value > 0) {
      requestCount.value--;
    } else {
      // 防御性：若计数器已为0，打印警告或重置
      console.warn("stopLoading called when requestCount is already 0");
    }
    updateLoadingState();
  }

  // 重置计数器（用于异常情况，如全局错误后重置）
  function reset() {
    requestCount.value = 0;
    if (delayTimer) clearTimeout(delayTimer);
    isLoading.value = false;
  }

  return {
    requestCount, // 可选暴露，供调试
    isLoading, // 组件直接使用
    startLoading,
    stopLoading,
    reset,
  };
});
