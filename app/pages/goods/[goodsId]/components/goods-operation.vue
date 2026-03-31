<!-- 商品操作 -->
<template>
  <div
    class="goods-operation-container fixed left-[calc(50%+800px-600px/2-16px-24px)] -translate-x-1/2 w-[600px] bottom-0 z-999 flex justify-start items-center p-24px gap-12px"
  >
    <div
      class="h-45px flex flex-row flex-1 justify-center items-center text-white hover:cursor-pointer"
    >
      <div
        class="h-full line-height-45px px-12px py-6px text-center add-cart rounded-l-8px iconfont icon-cart1"
        @click="addCart"
        style="flex: 1 0 0"
      ></div>
      <div
        class="h-full line-height-45px px-12px py-6px text-center bg-primary rounded-r-8px"
        @click="buyNow"
        style="flex: 4 0 0"
      >
        立即购买
      </div>
    </div>
    <div @click="toggleCollect">
      <el-icon color="var(--el-color-primary)">
        <StarFilled v-if="isCollect" />
        <Star v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, StarFilled } from "@element-plus/icons-vue";
import type {
  CartAddRequest,
  CartAddResponse,
} from "~~/server/types/cart";
const { $message } = useNuxtApp();
const cartStore = useCartStore();
const props = defineProps({
  goodsId: {
    type: Number,
    required: true,
  },
  currentSku: {
    type: Object,
    required: true,
  },
  skuCode: {
    type: String,
    required: true,
  },
});
const isCollect = ref(false);
function toggleCollect() {
  isCollect.value = !isCollect.value;
}

function addCart() {
  if (!props.currentSku.sku_code) {
    $message.warning("请选择商品规格");
    return;
  }
  console.log(props);
  cartStore.addCart({
    goods_id: props.goodsId,
    quantity: 1,
    sku_code: props.currentSku.sku_code,
    sku_value: props.currentSku.sku_value,
  });
}

function buyNow() {
  cartStore.addCart({
    goods_id: props.goodsId,
    quantity: 1,
    sku_value: props.currentSku.sku_value,
    sku_code: props.currentSku.sku_code,
  });
}
</script>

<style scoped lang="scss">
.goods-operation-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1);
}
.add-cart {
  background: linear-gradient(
    to right,
    #ffd700,
    var(--el-color-primary-light-3)
  );
}
</style>
