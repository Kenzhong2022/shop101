<template>
  <div class="w-100%">
    <h1 class="mb-1000px">帮助中心</h1>

    <div class="w-100% h-500px b-solid">
      <!-- 1. 用 background 做占位色，2. 1/1 即可，3. 保持 object-fit -->
      <img
        class="w-100% h-500px"
        ref="lazyImgRef"
        src="/img/banners/banner2.webp"
        data-src="/img/banners/banner1.webp"
        alt="帮助中心banner"
        style="
          aspect-ratio: 1/1; /* 占位高度 = 宽度 */
          object-fit: contain;
          background: pink; /* 任意占位色 */
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const lazyImgRef = ref<HTMLImageElement | null>(null);
// IntersectionObserver 实例
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (typeof window === "undefined" || !lazyImgRef.value) return;

  // 2. 配置 IntersectionObserver 选项
  observer = new IntersectionObserver(
    (entries) => {
      // 3. 遍历所有触发的元素
      for (const entry of entries) {
        console.log(
          "ratio:",
          entry.intersectionRatio,
          "boundingRect:",
          entry.boundingClientRect.height,
          "isIntersecting:",
          entry.isIntersecting
        );
        // 元素进入视口时触发
        if (entry?.isIntersecting) {
          console.log("元素进入视口");
          const img = entry.target as HTMLImageElement;
          console.log(img);
          img.src = img.dataset.src || "";
        }
      }
    },
    {
      // 元素进入视口时触发
      threshold: 1,
    }
  );

  // 监听目标容器
  observer.observe(lazyImgRef.value);
});

// 组件卸载清理
onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped></style>
