<!-- 这是首页页面 - 已优化首次加载性能 -->
<template>
  <kk-color-picker @change="handleColorChange" />
  <kk-image :src="banner6" />
  <!-- https://uy.wzznft.com/i/2025/10/25/gxxx4j.jpeg -->
  <!-- https://ibb.co/4wjH0LRK -->
  <!-- 电梯 banner区域 -->
  <div class="flex flex-col gap-50px" :style="{ flex: 1 }">
    <!-- 轮播图内容 -->
    <el-carousel
      :interval="1500"
      type="card"
      width="800px"
      :style="{
        border: '4px solid var(--el-color-primary)',
        aspectRatio: '7/2',
      }"
      class="rd-20px w-100%"
    >
      <el-carousel-item v-for="item in banners" :key="item.id">
        <NuxtImg
          :src="item.image"
          :alt="item.title"
          style="width: 100%; height: 100%; object-fit: fit"
        />
      </el-carousel-item>
    </el-carousel>

    <!-- 广告 -->
    <div
      class="banner w-100% h-200px rounded-20px flex justify-center items-center"
    >
      <h1 class="text-50px reflect-container">
        Wear Freedom ， shine your beauty
      </h1>
    </div>

    <div v-for="i in 5" :key="i" class="animate-fade-in">这是第一层</div>
  </div>
</template>

<script setup lang="ts">
// 引入全局 CSS 变量函数
import { setThemeColor } from "@/plugins/global-css-vars.client";

import { ref, onMounted } from "vue";
const color = ref("");
// 页面元数据
definePageMeta({
  title: "首页",
  layout: "default",
  pageInfo: {
    showBanner: true,
  },
});

interface Banner {
  id: number;
  title: string;
  image: string;
}

// 直接导入图片，确保路径被正确处理
const banner1 = "/img/banners/banner1.png";
const banner2 = "/img/banners/banner2.png";
const banner3 = "/img/banners/banner3.png";
const banner4 = "/img/banners/banner4.png";
const banner5 = "/img/banners/写真杂志1.jpeg";
const banner6 = "/img/banners/写真杂志2.jpeg";
import { string } from "three/tsl";

const banners: Banner[] = [
  {
    id: 1,
    title: "banner1",
    image: banner1,
  },
  {
    id: 2,
    title: "banner2",
    image: banner2,
  },
  {
    id: 3,
    title: "banner3",
    image: banner3,
  },
  {
    id: 4,
    title: "banner4",
    image: banner4,
  },
];

// 处理颜色选择变化
function handleColorChange(newHsl: string) {
  color.value = newHsl;
  console.log("即将转换主题色:", newHsl);
  if (process.client) {
    setThemeColor(newHsl);
  }
}
</script>

<style scoped>
/* 原元素容器 */
.reflect-container {
  position: relative;
  /* 确保伪元素不会超出容器 */
  overflow: visible;
  --c: var(--el-color-primary);
  font-size: 60px;
  font-weight: 900;
  color: #fff; /* 主色 */
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.25),
    /* 第 1 层 */ 2px 2px 0 rgba(0, 0, 0, 0.2), 3px 3px 0 rgba(0, 0, 0, 0.15),
    4px 4px 0 rgba(0, 0, 0, 0.1), 5px 5px 8px rgba(0, 0, 0, 0.8); /* 最后一层加模糊[8px]，制造厚度 */
}
/* 倒影效果（通过伪元素模拟） */
.reflect-container::after {
  content: "Wear Freedom ， shine your beauty";
  /* 复制原元素内容（如果是图片可直接用 background-image） */
  position: absolute;
  top: 100%; /* 与原元素底部对齐 */
  left: 0;
  width: 100%;
  height: 100%;
  /* 垂直翻转实现“倒影” */
  transform: scaleY(-1);
  /* 渐变遮罩（上透明60%，下渐暗25%黑色） */
  mask: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25));
  /* 如果原元素是图片，直接继承背景图 */
  background: inherit;
}

.banner {
  color: color-mix(in srgb-linear, #fff 90%, var(--el-color-primary, #fff));
  background-color: color-mix(
    in srgb-linear,
    #000 50%,
    var(--el-color-primary, #fff)
  );
}

/* 原始样式 */
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

/* 简单布局修改案例 - 轮播组件样式增强 */

/* 轮播容器样式 */
.custom-carousel {
  width: 100%; /* 宽度占满父容器 */
  max-width: 800px; /* 最大宽度限制为800px */
  padding: 200px; /* 内边距20px */
  background-color: #f5f7fa; /* 浅灰色背景 */
  border-radius: 12px; /* 圆角12px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 轻微阴影效果 */
}

/* 轮播项基础样式 */
.custom-carousel .el-carousel__item {
  border-radius: 8px; /* 卡片圆角8px */
  transition: all 0.3s ease; /* 所有变化300ms平滑过渡 */
}

/* 激活状态的卡片样式 */
.custom-carousel .el-carousel__item--card.is-active {
  transform: scale(1.05); /* 激活时放大1.05倍 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* 更深的阴影 */
  z-index: 10; /* 提高层级，确保在最上层显示 */
}

/* 轮播项内文字样式 */
.custom-carousel .el-carousel__item h3 {
  font-weight: bold; /* 字体加粗 */
  color: #333; /* 文字颜色加深 */
  font-size: 24px; /* 字体大小24px */
}

/* 添加淡入动画，提升用户体验 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

:deep(.el-carousel__container) {
  height: 100% !important;
}

/* 轮播图图片样式和悬停动画 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.5);
}
</style>
