/** * 提交订单 */
<template>
  <div class="order p-[20px] flex flex-row justify-between gap-[20px]">
    <!-- 左侧确认信息 -->
    <order-aside class="flex-1" :order="masterOrder" />
    <!-- 右侧提交订单操作 -->
    <order-actions class="flex-1" :order="masterOrder" />
  </div>
</template>
<script setup lang="ts">
import OrderAside from "./order-aside.vue";
import OrderActions from "./order-actions.vue";
import type { OrderCreateResponse } from "~~/server/types/order";
type OrderData = OrderCreateResponse["data"];

definePageMeta({ name: "order" });
const router = useRouter();
const masterOrder = ref<OrderData>();
//const subOrder = ref<OrderData["subOrders"]>([]);
onMounted(() => {
  // 从路由参数中获取订单号
  const orderNo = router.currentRoute.value.query.orderNo as string;
  // 从sessionStorage中获取订单信息
  const orderInfo = sessionStorage.getItem(orderNo);
  if (orderInfo) {
    // 解析订单信息
    const order = JSON.parse(orderInfo) as OrderData;
    masterOrder.value = order;
    // subOrder.value = order.subOrders;
  }
});
</script>
