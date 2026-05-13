<!-- 这是首页页面 - 已优化首次加载性能 -->
<template>
  <!-- https://uy.wzznft.com/i/2025/10/25/gxxx4j.jpeg -->
  <!-- https://ibb.co/4wjH0LRK -->
  <!-- 电梯 banner区域 -->
  <div class="flex flex-col gap-50px" :style="{ flex: 1 }">
    <div class="flex px-[20px] bg-[#fff]">
      <!-- 分类树 - 不再需要传递data属性 -->
      <kk-category-tree class="flex-[2]" />
      <!-- 轮播图内容 -->
      <el-carousel
        :interval="150000"
        type="card"
        :style="{
          border: '2px solid var(--el-color-primary)',
          aspectRatio: '7/2',
        }"
        class="box-border rd-10px w-100% flex-[7]"
        ref="carousel"
      >
        <el-carousel-item
          ref="carouselItem"
          v-for="item in banners"
          :key="item.id"
        >
          <!-- todo:宽度和高度需要根据当前的页面宽度和高度来计算 -->
          <kk-cld-image
            :src="item.image"
            :alt="item.title"
            :width="700"
            :height="450"
            gravity="auto"
            crop="fill"
            :priority="true"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 广告 -->
    <!-- <div class="relative w-100%" :style="{ aspectRatio: '18/2' }">
      <div
        class="absolute banner w-100% flex justify-center items-center"
        :style="{
          aspectRatio: '18/2',
        }"
      >
        <div class="reflect-container">Wear Freedom ， shine your beauty</div>
      </div>
    </div> -->

    <!-- 商品列表 -->
    <!-- 商品列表行 -->
    <div class="flex flex-wrap px-20px">
      <!-- 一排五个 gap25 -->
      <kk-goods-item
        :collected-mode="false"
        :data="goodsList"
        :loading="loadingGoods"
        @loadMore="loadMore"
        :has-more="hasMore"
        @click="handleClick"
        @check-change="({ id, checked }) => updateItemChecked(id, checked)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiGoodsList } from "~/api/goods";
import { useLoadingStore } from "@/stores/loading";
import { useProductBehavior } from "~/composables/useProductBehavior";
import type { Goods } from "~~/server/types/goods";
const loadingStore = useLoadingStore();
// 引入消息提示组件
const { $message } = useNuxtApp();

// 页面元数据
definePageMeta({
  title: "首页",
  layout: "default",
  pageInfo: {
    showBanner: true,
  },
  layoutOptions: {
    showSearch: true,
    isStickyMode: true,
  },
});

interface Banner {
  id: number;
  title: string;
  image: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "banner1",
    image: "banner1_zbk4tg",
  },
  {
    id: 2,
    title: "banner2",
    image: "banner2_xpc88k",
  },
  {
    id: 3,
    title: "banner3",
    image: "banner3_fxo6xk",
  },
  {
    id: 4,
    title: "banner4",
    image: "banner4_o3l0jf",
  },
];

const goodsList = ref<Goods[]>();

const loadingGoods = ref<boolean>(true);

/**
 * 点击商品跳转详情页（行为上报移至详情页离开时）
 * @param goodsItem 点击的商品项
 */
function handleClick(goodsItem: Goods) {
  // 直接跳转，行为上报在详情页离开时进行
  navigateTo(`/goods/${goodsItem.id}/detail`);
}
// 点击操作按钮处理函数
function updateItemChecked(id: number, checked: boolean) {
  const goodsItem = goodsList.value?.find((item) => item.id === id);
  if (goodsItem) {
    goodsItem.isChecked = checked;
  }
}
const hasMore = ref<boolean>(true);

const currentPage = ref<number>(1);
async function getGoodsList() {
  loadingGoods.value = true;
  // 是否没有更多
  await apiGoodsList({
    page: currentPage.value,
    page_size: 5,
  })
    .then((res) => {
      currentPage.value++;
      // 检查是否有更多数据
      hasMore.value = res.data.list.length !== 0;
      // 合并商品列表，追加新数据
      goodsList.value = [...(goodsList.value || []), ...res.data.list];
      // 初始化新数据的 isChecked 为 false
      goodsList.value.forEach((item) => {
        item.isChecked = false;
      });
    })
    .finally(() => {
      loadingGoods.value = false;
      $message.success("加载完成");
    });
  return hasMore.value;
}

/* 追加 5 行并重新监听最后一行 */
async function loadMore() {
  $message.info("加载更多...");
  hasMore.value = await getGoodsList(); // 1. 先加载数据
  if (!hasMore.value) {
    $message.info("没有更多商品了");
  }
}

onMounted(async () => {
  await getGoodsList();
  loadingGoods.value = false;

  if (tokenExpried()) {
    testRecommendApi();
  }
});

/**
 * 测试推荐接口
 */
async function testRecommendApi() {
  try {
    // 使用用户ID 1测试推荐接口
    const userId = 1;
    const response = await fetch(`/api/recommend`);
    const data = await response.json();

    console.log("📚 [推荐接口测试] 用户ID:", userId);
    console.log("📊 [推荐接口测试] 响应数据:", data);

    if (data.recommendations && data.recommendations.length > 0) {
      console.log(`✅ [推荐接口测试] 成功获取 ${data.count} 条推荐`);
      console.log(
        "🔍 [推荐接口测试] 推荐列表:",
        data.recommendations.slice(0, 5),
      );
    } else {
      console.log("ℹ️ [推荐接口测试] 暂无推荐数据:", data.message);
    }
  } catch (error) {
    console.error("❌ [推荐接口测试] 失败:", error);
  }
}

onUnmounted(() => {});
</script>

<style scoped>
/* 原元素容器 */
.reflect-container {
  position: relative;
  /* 确保伪元素不会超出容器 */
  overflow: visible;
  --c: var(--el-color-primary);
  font-weight: 900;
  color: #fff; /* 主色 */
  text-shadow:
    1px 1px 0 rgba(0, 0, 0, 0.25),
    /* 第 1 层 */ 2px 2px 0 rgba(0, 0, 0, 0.2),
    3px 3px 0 rgba(0, 0, 0, 0.15),
    4px 4px 0 rgba(0, 0, 0, 0.1),
    5px 5px 8px rgba(0, 0, 0, 0.8); /* 最后一层加模糊[8px]，制造厚度 */
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
