/** * 提交订单 */
<template>
  <div class="order p-[20px] flex flex-row justify-between gap-[20px]">
    <!-- 左侧确认信息 -->
    <order-aside
      class="flex-1"
      :order="masterOrder"
      :addressList="addressList"
      @refreshAddressList="getDataAddressList"
      @selectAddress="handleSelectAddress"
    />
    <!-- 右侧提交订单操作 -->
    <order-actions class="flex-1" :order="masterOrder" :address="address" />
  </div>
</template>
<script setup lang="ts">
import OrderAside from "./order-aside.vue";
import OrderActions from "./order-actions.vue";
import type { UserAddress } from "~~/server/types/user-address";
import { getAddressListApi, updateAddressApi } from "@/api/addressApi";
import type { OrderCreateResponse } from "~~/server/types/order";
type OrderData = OrderCreateResponse["data"];

definePageMeta({ name: "order" });
const router = useRouter();
const masterOrder = ref<OrderData>();
//const subOrder = ref<OrderData["subOrders"]>([]);
const addressList = ref<UserAddress[]>([]);

const address = computed(() => {
  // 有选中地址
  const checked = addressList.value.find((item) => item.isChecked);
  if (checked) return checked;
});
onMounted(() => {
  getDataAddressList();
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

onActivated(() => {
  getDataAddressList();
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
function getDataAddressList() {
  getAddressListApi().then((res) => {
    addressList.value = res.data.list.map((item) => ({
      ...item,
      isChecked: item.is_default,
    }));
  });
}
// 选择地址
function handleSelectAddress(address: UserAddress) {
  // 取消其他地址的选中状态
  addressList.value.forEach((item) => {
    if (item !== address) {
      item.isChecked = false;
    }
  });
  // 选中当前地址
  address.isChecked = true;
}
</script>
