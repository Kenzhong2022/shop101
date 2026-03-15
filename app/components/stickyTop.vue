<template>
  <div
    class="sticky-top-container max-h-100px h-fit py-8px flex justify-around items-center"
    ref="containerRef"
    :class="{ 'is-sticky': isSticky }"
  >
    <kk-search class="flex-1 max-w-800px" />
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
    isSticky.value = scrollPosition >= offsetTop.value; // 页面向下滚动的距离 大于 & 等于 搜索框在页面中的位置 + 搜索框自身高度的一半60/2
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
  transition: all 0.3s ease;
  z-index: 100;
  width: 100%;

  &.is-sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: white;
  }
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
