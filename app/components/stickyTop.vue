<template>
  <div
    class="sticky-top-container max-h-100px h-10vh py-16px flex justify-around items-center"
    ref="containerRef"
    :class="{ 'is-sticky': isSticky }"
  >
    <!-- <img src="/KKShopLogo.svg" /> -->
    <el-image
      :lazy="true"
      class="flex-3"
      src="/KKShopLogo.svg"
      style="height: 100%; aspect-ratio: 1 / 1"
    />
    <kk-search class="flex-1" />
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

  &.is-sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 10vh;
    background-color: white;
    padding: 8px 0;
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
