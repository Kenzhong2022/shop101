<template>
  <div
    class="flex flex-col items-start justify-start w-[calc(100%-600px-24px-24px)]"
  >
    <!-- 商品图片展示 -->
    <goods-display :goods-name="goodsName" :image="image"></goods-display>
    <!-- tabs导航栏 默认显示商品参数信息 -->
    <goods-tabs></goods-tabs>
  </div>
</template>

<script setup lang="ts">
import GoodsDisplay from "./goods-display.vue";
import GoodsTabs from "./goods-tabs.vue";

const props = defineProps<{
  goodsName: string;
  image: string;
}>();
</script>
