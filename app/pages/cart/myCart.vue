<template>
  <div class="flex justify-between items-start gap-20px text-[14px]">
    <div class="cart-list-container flex-[5] flex flex-col h-[1200px] p-20px">
      <cart-list
        v-loading="loadingStore.isLoading"
        :cart-list="cartStore.cartList"
        v-if="cartStore.cartList.length > 0"
      />
      <el-empty v-else description="购物车是空的">
        <el-button type="primary" @click="goToHome()"
          >前往首页浏览
          <div class="iconfont icon-back"
        /></el-button>
      </el-empty>
    </div>
    <cart-summary
      class="flex-[2] overflow-hidden text-[14px]"
      :cart-list="cartStore.cartList"
      :total-price="cartStore.totalPrice"
    />
  </div>
</template>

<script setup>
definePageMeta({
  title: "购物车",
  pageInfo: {
    requiresAuth: true,
  },
  layoutOptions: {
    showSearch: false,
  },
});
import cartList from "./components/cart-list.vue";
import cartSummary from "./components/Cart-Summary.vue";
import { useCartStore } from "@/stores/cart";
const loadingStore = useLoadingStore();
const cartStore = useCartStore();
const router = useRouter();

// 前往首页
function goToHome() {
  router.push("/");
}

// 加载购物车列表
onMounted(async () => {
  await cartStore.loadCartList();
});
onActivated(async () => {
  console.log("🛒 购物车组件被激活，重新加载数据");
  await cartStore.loadCartList();
});
</script>
