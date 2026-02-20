/** * 商品组件 */
<template>
  <div class="p-2 box-border goodsItem">
    <div class="overflow-hidden relative" ref="imgRef">
      <!-- 加载动画 -->
      <kk-svg-loader-fast v-if="loading" :width="280" />
      <kk-cld-image
        v-else
        :src="goodsItem.image"
        :alt="goodsItem.image"
        :width="280"
        :height="280"
        :radius="20"
        :aspectRatio="280 / 280"
        gravity="auto"
        crop="fill"
      />
      <div
        class="absolute top-0 right-0 bg-red-500 text-white px-2 rounded-bl-lg"
      >
        热卖
      </div>
      <!-- 操作按钮 -->
      <el-checkbox
        v-if="collectedMode"
        size="large"
        class="checked_btn"
        @click.stop="handleChildClick(goodsItem)"
      />
    </div>
    <!-- 商品名称：超过一行显示省略号 -->
    <div class="text-ellipsis whitespace-nowrap overflow-hidden">
      {{ goodsItem.goods_name }}
    </div>
    <div>商品内容:{{ goodsItem.price }}元{{ goodsItem.sales }}</div>
    <div>店铺名: {{ goodsItem.shop_name }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Goods } from "~~/server/api/goods/list.post";

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
  goodsItem: {
    type: Object as PropType<Goods>,
    default: () => ({}),
  },
  collectedMode: {
    type: Boolean,
    default: false,
  },
});

const shadowMode = ref<"never" | "always" | "hover">("never");
const imgRef = ref<HTMLDivElement>();

function handleChildClick(goodsItem: Goods) {
  console.log("点击了按钮", goodsItem);
}
</script>

<style scoped lang="scss">
.goodsItem {
  --w: 300px;
  width: var(--w);
  cursor: pointer; /* 鼠标悬停样式 */
  position: relative;
}

.el-card {
  margin-bottom: 20px;
}
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}

:deep(.el-checkbox__input) {
  position: absolute;
  top: calc(16px - 280px);
  left: 16px;
  .el-checkbox__inner {
    width: 20px;
    height: 20px;
  }
}
</style>
