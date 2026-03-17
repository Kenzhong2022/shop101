<template>
  <div
    class="cart-item py-[12px] px-[8px] flex flex-col justify-between"
    v-for="(item, index) in cartItem"
    :key="item.goods_id"
  >
    <div
      class="cart-item-content flex-1 flex flex-row items-start gap-[8px] text-center"
    >
      <el-checkbox
        class="self-center"
        size="large"
        v-model="item.selected"
        @change="handleSelected(item)"
      />
      <!-- 商品image -->
      <kk-cld-image :width="100" :height="100" :radius="8" :src="item.image" />
      <!-- 商品名 -->
      <div class="flex-[3] text-start">{{ item.goods_name }}</div>
      <!-- 商品规格 -->
      <div class="flex-1">
        {{ item.sku_value }}
      </div>
      <!-- 商品价格 -->
      <div class="flex-1 text-[#999]">
        {{ item.price }}
      </div>
      <!-- 商品数量 -->
      <div class="flex-1">
        <el-input-number
          :min="1"
          :max="10"
          :step="1"
          size="small"
          v-model="item.quantity"
        />
      </div>
      <!-- 右边：操作列 -->
      <div
        class="ml-auto flex-[80px] flex flex-col items-center justify-end gap-[8px] text-center"
      >
        <div class="text-[12px] text-[#999] hover:text-primary cursor-pointer">
          移入收藏
        </div>
        <div
          class="text-[12px] text-[#999] hover:text-primary cursor-pointer"
          @click="removeCartItem(item.id)"
        >
          删除
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GoodsItem } from "@/stores/cart";

const props = defineProps({
  cartItem: {
    type: Array as PropType<GoodsItem[]>,
    default: () => [],
  },
  shopName: {
    type: String,
    default: "",
  },
});

import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();
function removeCartItem(id: number) {
  cartStore.removeCart([id]);
}

function handleSelected(item: GoodsItem) {
  console.log(item);
  cartStore.toggleSelect(item.goods_id, item.selected || false, props.shopName);
}
</script>

<style scoped lang="scss">
.el-button + .el-button {
  margin-left: initial !important;
}

:deep(.el-checkbox__input .el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
}
</style>
