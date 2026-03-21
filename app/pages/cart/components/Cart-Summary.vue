<template>
  <div
    class="m-20px p-20px border-[1px] border-solid border-[#e5e5e5] rd-20px flex flex-col justify-between items-start gap-20px text-[#333]"
    :class="{ 'aspect-[1/1]': !isExpanded }"
  >
    <!-- 结算模块标题 -->
    <div class="text-24px font-bold text-[#333]">结算明细</div>
    <!-- 结算模块内容 -->
    <div v-if="cartList.length" class="w-full flex-1 summary-content">
      <!-- 商品图片列表 两行图片超过两行则隐藏 -->
      <kk-cld-image
        v-for="item in selectedItems.slice(
          0,
          isExpanded ? selectedItems.length : 6,
        )"
        :key="item.shop_name"
        :width="100"
        :height="100"
        :radius="8"
        :src="item.image"
      />
    </div>
    <!-- 遮罩层 + 按钮 (仅在未展开且数量>6时显示) -->
    <div
      v-if="selectedItems.length > 6"
      class="hover:text-primary cursor-pointer text-center w-full text-[#999]"
    >
      <div v-if="!isExpanded" @click="isExpanded = true">
        查看全部 {{ selectedItems.length }} 件商品
      </div>
      <div v-else @click="isExpanded = false">
        收起 {{ selectedItems.length }} 件商品
      </div>
    </div>
    <!-- 结算模块底部 -->
    <div class="w-full">
      <div class="text-24px font-bold text-[#333]">
        <span>合计：</span>
        <span class="text-primary">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
      <!-- 结算按钮 -->
      <div
        class="w-full h-[60px] bg-primary text-white font-bold text-center line-height-60px rd-20px"
        @click="handleSettle"
      >
        结算{{ selectedItems.length ? `(${selectedItems.length})` : "" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopItem } from "@/stores/cart";
const props = defineProps({
  cartList: {
    type: Array as PropType<ShopItem[]>,
    default: () => [],
  },
});
import { useCartStore } from "@/stores/cart";
import type { OrderCreateResponse } from "~~/server/api/orders/create.post";
const { $message } = useNuxtApp();
const router = useRouter();
const cartStore = useCartStore();
const selectedItems = computed(() => {
  return props.cartList.flatMap((shop) =>
    shop.items.filter((item) => item.selected),
  );
});

const isExpanded = ref(false); // 是否展开商品列表

// 处理结算按钮点击事件
function handleSettle() {
  if (selectedItems.value.length === 0) {
    $message.warning("请选择商品");
    return;
  }
  // 创建订单
  cartStore
    .createOrder(selectedItems.value)
    .then((res: OrderCreateResponse) => {
      if (res.code === 200) {
        $message.success("订单创建成功");
        // 利用订单号 为key 存储订单信息到sessionStorage
        sessionStorage.setItem(
          res.data.masterOrderNo,
          JSON.stringify(res.data),
        );
        // 跳转到结算页面 并传递订单号
        router.push({
          name: "order",
          query: {
            orderNo: res.data.masterOrderNo,
          },
        });
      }
    });
}
</script>

<style scoped lang="scss">
.summary-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 8px;
}
</style>
