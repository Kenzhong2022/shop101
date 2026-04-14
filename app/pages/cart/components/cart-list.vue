<template>
  <div>
    <cart-operation :is-all-selected="cartStore.isAllSelected" />
    <div
      class="cart-list"
      :class="{
        'border-b-[1px] border-b-solid border-b-[#ccc]':
          index == cartList.length - 1,
      }"
      v-for="(item, index) in cartList"
      :key="item.shop_name"
    >
      <div
        class="cart-item-title flex flex-row items-center gap-[8px] border-t-[1px] border-t-solid border-t-[#ccc]"
      >
        <!-- 全选checkbox -->
        <el-checkbox
          size="large"
          :model-value="isShopAllSelected(item.shop_name)"
          @change="(val: boolean) => toggleShopSelect(item.shop_name, val)"
        />
        <!-- 店铺名 -->
        <div class="shop-name flex-1">{{ item.shop_name }}</div>
      </div>
      <cart-item :cart-item="item.items" :shop-name="item.shop_name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopItem } from "@/stores/cart";
import cartOperation from "./cart-operation.vue";
import cartItem from "./cart-item.vue";
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();
const props = defineProps({
  cartList: {
    type: Array as PropType<ShopItem[]>,
    default: () => [],
  },
});

// 计算属性：店铺是否全选
function isShopAllSelected(shopName: string): boolean {
  const shop = props.cartList.find((s) => s.shop_name === shopName);
  if (!shop || !shop.items.length) return false;
  return shop.items.every((item) => item.selected);
}

/**
 * 一键全选/取消全选该店铺下所有商品
 * @param shopName 店铺名称
 * @param selected 是否选中
 */
function toggleShopSelect(shopName: string, selected: boolean) {
  console.log(shopName, selected);
  const shop = props.cartList.find((s) => s.shop_name === shopName);
  if (shop) {
    // 一键全选/取消全选该店铺下所有商品
    shop.items.forEach((item) => (item.selected = selected));
  }
}
</script>

<style scoped lang="scss">
:deep(.el-checkbox__input .el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
}
</style>
