/** * 商品组件 */
<template>
  <div
    :shadow="shadowMode"
    :class="{ 'shadow-lg': shadowMode === 'always' }"
    class="p-2 box-border goodsItem"
    @mouseenter="shadowMode = 'always'"
    @mouseleave="shadowMode = 'never'"
  >
    <div class="flex-4 overflow-auto" ref="imgRef">
      <!-- 加载动画 -->
      <kk-svg-loader-fast v-if="loading" :width="300" :height="300" />
      <kk-cld-image v-else :src="goods.image" alt="商品图片" />
    </div>
    <div>{{ goods.goods_name }}</div>
    <div>商品内容:{{ goods.price }}元{{ goods.sales }}</div>
    <div>店铺名: {{ goods.shop_name }}</div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
const props = defineProps({
  title: {
    type: String,
    default: "商品",
  },
  image: {
    type: String,
    default: "good_1_w3mjkm.webp",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  goods: {
    type: Object,
    default: () => ({}),
  },
});

const shadowMode = ref<"never" | "always" | "hover">("never");

onMounted(async () => {});
</script>

<style scoped lang="scss">
.goodsItem {
  --w: 300px;
  width: var(--w);
  transition: transform 0.3s ease; /* 平滑过渡效果 */
  transform-origin: center center;
  cursor: pointer; /* 鼠标悬停样式 */
  position: relative;
}
.goodsItem:hover {
  transform: translateY(-10px) scale(1.05); /* 向上浮起10px并轻微放大 */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2); /* 添加阴影增强浮起效果 */
  z-index: 1; /* 提高层级确保在最上层显示 */
}

/* 移动端优化 */
@media (hover: none) {
  .goodsItem:hover {
    transform: none;
    box-shadow: none;
  }
}

.el-card {
  margin-bottom: 20px;
}
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}
</style>
