<!-- 收藏商品列表 -->
<template>
  <div class="flex flex-wrap px-20px">
    <kk-goods-item
      v-for="item in data.GoodsItems"
      :key="item.id"
      :collected-mode="true"
      :goods-item="item"
    />
  </div>
</template>

<script setup lang="ts">
import type { Goods } from "~~/server/api/goods/list.post";
import type { apiFavoritesProductsListResponseData } from "~~/server/api/favorites/products/list.post";

const props = defineProps({
  data: {
    type: Object as PropType<apiFavoritesProductsListResponseData>,
    default: () => {},
  },
});
</script>
