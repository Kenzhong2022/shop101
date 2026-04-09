<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-row">
          <div>付款详情</div>
        </div>
      </template>
      <template #default>
        <div>
          <div>订单号：{{ order?.masterOrderNo || "" }}</div>
          <div>金额：{{ order?.totalAmountDisplay || "" }}</div>
        </div>
      </template>
      <template #footer>
        <div>
          <el-button type="primary" @click="handlePay"
            >确认付款{{ address?.id }}</el-button
          >
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { OrderCreateResponse } from "~~/server/types/order";
import type { UserAddress } from "~~/server/types/user-address";
type OrderData = OrderCreateResponse["data"];

const props = defineProps({
  order: {
    type: Object as PropType<OrderData>,
    default: () => {},
  },
  address: {
    type: Object as PropType<UserAddress>,
    default: () => {},
  },
});

const handlePay = async () => {
  // 参数校验
  if (!props.order || !props.address) {
    alert("订单信息或地址不能为空");
    return;
  }
  try {
    // 1. 调用后端接口
    const res = await $fetch("/api/payment/alipay/create", {
      method: "POST",
      body: {
        orderInfo: props.order, // 订单信息
        orderId: props.order!.masterOrderNo, // 你的真实订单号
        amount: props.order!.totalAmountDisplay.replace("¥", "") || 0,
        subject: "通过主订单支付",
        addressId: props.address!.id,
      },
    });

    if (res.success) {
      // 2. 将返回的 HTML 写入一个新窗口或 iframe
      // 这是支付宝官方推荐的页面跳转方式
      const win = window.open("", "_self");
      if (win) {
        win.document.write(res.data.html);
        win.document.close();
      } else {
        alert("请允许弹出窗口以进行支付");
      }
    }
  } catch (err) {
    console.error(err);
    alert("支付初始化失败");
  }
};
</script>
