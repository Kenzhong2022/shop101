<template>
  <div class="flex justify-between items-start gap-20px text-[14px]">
    <div class="cart-list-container flex-[5] flex flex-col h-[1200px] p-20px">
      <cart-list :cart-list="cartStore.cartList" />
    </div>
    <cart-summary
      class="flex-[2] overflow-hidden text-[14px]"
      :cart-list="cartStore.cartList"
      :total-price="cartStore.totalPrice"
    />
  </div>
  <div class="flex justify-end items-center gap-20px">
    <testPay />
  </div>
</template>

<script setup>
import cartList from "./components/cart-list.vue";
import cartSummary from "./components/Cart-Summary.vue";
import { useCartStore } from "@/stores/cart";
import testPay from "./components/testPay.vue";

const cartStore = useCartStore();
// 加载购物车列表
onMounted(async () => {
  await cartStore.loadCartList();
});
onActivated(async () => {
  console.log("🛒 购物车组件被激活，重新加载数据");
  await cartStore.loadCartList();
});
</script>
