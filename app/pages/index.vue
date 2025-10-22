<!-- 这是首页页面 - 已优化首次加载性能 -->
<template>
  <kk-color-picker @change="(val:string) => (color = val)" />
  <!-- 电梯 banner区域 -->
  <div class="flex flex-col gap-8" :style="{ flex: 1 }">
    <!-- 首屏内容 -->
    <el-carousel
      :interval="150000"
      type="card"
      width="800px"
      :style="{ border: '4px solid var(--el-color-primary)' }"
      class="rd-20px"
    >
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img
          :src="item.image"
          :alt="item.title"
          style="width: 100%; height: 100%; object-fit: cover"
        />
      </el-carousel-item>
    </el-carousel>
    <img
      class="w-100px h-100px object-cover"
      src="/assets/img/banners/banner1.png"
      alt=""
    />
    <img
      class="w-100px h-100px object-cover"
      src="/assets/img/banners/banner2.png"
      alt=""
    />
    <div v-for="i in 5" :key="i" class="animate-fade-in">这是第一层</div>
  </div>
</template>

<script setup lang="ts">
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
import banner1 from "@/assets/img/banners/banner1.png";
import banner2 from "@/assets/img/banners/banner2.png";
import banner3 from "@/assets/img/banners/banner3.png";
import banner4 from "@/assets/img/banners/banner4.png";

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
</script>

<style scoped>
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
