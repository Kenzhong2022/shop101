<template>
  <div
    class="sticky-top-container h-72px py-16px flex justify-around items-center"
    ref="containerRef"
    :class="{ 'is-sticky': isSticky }"
  >
    <el-image
      loading="lazy"
      src="/KKShopLogo.svg"
      style="width: 100px; height: 100px"
    />
    <kk-search></kk-search>
    <el-image
      loading="lazy"
      src="/KKShopLogo.svg"
      style="width: 100px; height: 100px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 控制吸顶状态
const isSticky = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const offsetTop = ref(0);

// 处理滚动事件
const handleScroll = () => {
  if (containerRef.value) {
    const scrollPosition = window.scrollY;
    isSticky.value = scrollPosition >= offsetTop.value; // 当滚动位置超过或等于偏移量时吸顶
  }
};

// 组件挂载时记录初始位置并添加滚动监听
onMounted(() => {
  if (containerRef.value) {
    offsetTop.value = containerRef.value.offsetTop;
  }
  window.addEventListener("scroll", handleScroll);
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped lang="scss">
.sticky-top-container {
  width: 100%;
  transition: all 0.3s ease;
  z-index: 100;

  // 使用 JavaScript 控制的吸顶样式
  &.is-sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background-color: white;
    padding: 8px 0;
    animation: slideDown 0.3s ease-in-out;
  }

  // 备用方案：纯 CSS 吸顶实现（如果 JavaScript 实现有问题）
  // position: sticky;
  // top: 0;
  // z-index: 100;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%); // 从顶部above隐藏
  }
  to {
    transform: translateY(0);
  }
}
</style>
