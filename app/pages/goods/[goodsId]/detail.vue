/** * 商品详情页 */
<template>
  <div class="flex">
    <goods-main :goods-name="goodsName" :image="image"></goods-main>
    <goods-aside
      class="fixed left-[calc(50%+800px-300px-16px-24px)] -translate-x-1/2 w-600px z-999"
      :style="{
        top: (scrollY < 65 ? 132 + 65 + 16 - scrollY : 132) + 'px',
      }"
      :goods-name="goodsName"
      :spec-list="specList"
      :sku-list="skuList"
    ></goods-aside>
  </div>
</template>

<script setup lang="ts">
import { useScroll } from "@/composables/useScroll";

import GoodsMain from "./components/goods-main.vue";
import GoodsAside from "./components/goods-aside.vue";

import { apiGoodsSpecs } from "@/api/goods";
import type {
  SpecValue,
  SpecDimension,
  SkuInfo,
} from "~~/server/api/goods/[id]/specs.get.ts";

const { scrollY, scrollX } = useScroll();

onMounted(async () => {
  // 从路由http://localhost:3000/goods/3/detail 中获取商品ID
  const goodsId = useRoute().params.goodsId;

  const { data } = await apiGoodsSpecs({ goods_id: Number(goodsId) });
  goodsName.value = data.goods_name;
  image.value = data.image;
  skuList.value = data.skus;
  specList.value = data.dimensions;
});

// ==========================================
// 数据初始化
// ==========================================
const specList = ref<SpecDimension[]>([]); // 规格维度列表（从后端获取）
const skuList = ref<SkuInfo[]>([]); // 扁平的库存 SKU 列表（从后端获取）
const image = ref<string>(""); // 商品图片（从后端获取）
const goodsName = ref<string>(""); // 商品名称（从后端获取）
</script>

<style scoped></style>
