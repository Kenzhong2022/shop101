<template>
  <div>
    <!-- 订单操作按钮 -->
    <!-- <order-operation /> -->
    <!-- 订单列表展示区域 -->
    <div class="flex flex-row text-center text-[#999] text-sm">
      <div class="flex-[7]">订单信息</div>
      <div class="flex-[1]">商品金额</div>
      <div class="flex-[1]">总实付金额</div>
      <div class="flex-[1]">订单操作</div>
    </div>
    <div v-loading="isLoading" class="w-[100%] h-[50%]">
      <div v-if="orderListEmpty">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="goBack()"
            >前往首页浏览
            <div class="iconfont icon-back"
          /></el-button>
        </el-empty>
      </div>
      <div
        v-else
        v-for="subOrderItem in Object.values(orderMap)"
        :key="subOrderItem[0]!.order_shop_id"
      >
        <!-- 子订单头部信息 -->
        <div
          class="bg-[#eee] p-[10px] rounded-md mt-[10px] flex flex-row gap-[10px] text-sm"
        >
          <div>订单号：{{ subOrderItem[0]!.slave_order_no }}</div>
          <div>|</div>
          <div>{{ subOrderItem[0]!.shop_name }}</div>
        </div>
        <!-- table标签 列共有10列 第一列 跨列7 剩余的平均分配 -->
        <table class="w-full">
          <tr
            v-for="(goods, index) in subOrderItem"
            :key="`${goods.sku_code}_${goods.goods_id}`"
            class="my-[10px]"
          >
            <td colspan="7" class="w-[70%] text-center align-top">
              <div class="flex items-start">
                <kk-cld-image
                  :src="goods.image"
                  :width="80"
                  :height="80"
                  :priority="true"
                />
                <div
                  class="flex-1 flex flex-col justify-start items-start ml-[10px]"
                >
                  <div>{{ goods.goods_name }}</div>
                  <div class="text-sm text-[#999]">{{ goods.sku_value }}</div>
                </div>
              </div>
            </td>
            <!-- 剩余3列平均分配：3个1列 -->
            <td colspan="1" class="w-[10%] text-center align-top">
              <div class="flex flex-col justify-start items-center">
                <div>￥{{ goods.price }}</div>
                <div class="text-sm text-[#999]">x{{ goods.quantity }}</div>
              </div>
            </td>
            <td
              colspan="1"
              class="w-[10%] text-center align-top"
              v-if="index === 0"
            >
              <div class="">
                总实付金额：<span class="text-[#f00]"
                  >￥{{ getTotalPrice(subOrderItem) }}</span
                >
              </div>
            </td>
            <td
              colspan="1"
              :rowspan="subOrderItem.length"
              class="w-[10%] text-center align-top"
              v-if="index === 0"
            >
              <div class="text-center" :class="`h-fit`">
                <el-button
                  v-if="
                    goods.is_expired &&
                    goods.item_status === OrderStatus.CANCELLED
                  "
                  text
                  >订单交易已过期</el-button
                >
                <el-countdown
                  v-else-if="goods.item_status === OrderStatus.PENDING_PAYMENT"
                  title="过期时间"
                  :value="dayjs(goods.shop_expire_at).valueOf()"
                  @finish="handleCountdownFinish(goods)"
                />
                <el-button type="primary">加入购物车</el-button>
                <el-button text type="default">查看详情</el-button>
                <el-button
                  text
                  v-if="
                    goods.item_status === OrderStatus.PENDING_PAYMENT &&
                    !goods.is_expired
                  "
                  type="default"
                  @click="handleCancelClick(subOrderItem)"
                  >取消订单</el-button
                >
                <el-button
                  text
                  v-if="
                    goods.item_status === OrderStatus.PENDING_PAYMENT &&
                    !goods.is_expired
                  "
                  type="primary"
                  @click="handlePayClick(subOrderItem)"
                  >立即支付</el-button
                >
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
import dayjs from "dayjs";
import type { PropType } from "vue";
import type { OrderItem } from "~~/server/types/order";
import { ORDER_STATUS_LABEL_MAP, OrderStatus } from "~~/server/types/order";

const props = defineProps({
  orderMap: {
    type: Object as PropType<Record<string, OrderItem[]>>,
    default: () => {},
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
const orderListEmpty = computed(() => {
  return Object.values(props.orderMap).every((items) => items.length === 0);
});

// 计算总实付金额
function getTotalPrice(orderItems: OrderItem[]) {
  return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

async function handlePayClick(subOrderItem: OrderItem[]) {
  console.log(subOrderItem, Object.keys(props.orderMap));
  try {
    // 1. 调用后端接口
    const res = await $fetch("/api/payment/alipay/create", {
      method: "POST",
      body: {
        orderId: subOrderItem[0]!.slave_order_no || "", // 你的真实订单号
        amount: getTotalPrice(subOrderItem) || 0,
        subject: "通过子订单支付",
        addressId: subOrderItem[0]!.address_id || 0,
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
}

function handleCountdownFinish(goods: OrderItem) {
  goods.is_expired = true;
}

function goBack() {
  console.log("goBack");
  router.push("/");
}
/**
 * 取消订单 仅支持过期订单
 * @param subOrderItem
 */
function handleCancelClick(subOrderItem: OrderItem[]) {
  console.log(subOrderItem, Object.keys(props.orderMap));
}
</script>

<style scoped lang="scss">
.el-button + .el-button {
  margin-left: initial !important;
}
</style>
