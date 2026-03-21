<template>
  <div>
    <!-- 订单操作按钮 -->
    <order-operation />
    <!-- 订单列表展示区域 -->
    <div class="flex flex-row">
      <div class="flex-[7] text-center">订单信息</div>
      <div class="flex-[1] text-center">商品金额</div>
      <div class="flex-[1] text-center">总实付金额</div>
      <div class="flex-[1] text-center">订单操作</div>
    </div>
    <div
      v-for="subOrderItem in Object.values(orderMap)"
      :key="subOrderItem[0]!.order_shop_id"
    >
      <!-- 子订单头部信息 -->
      <div class="text-lg font-bold bg-[#eee] p-2 rounded-md">
        {{ subOrderItem[0]!.slave_order_no }}
      </div>
      <!-- table标签 列共有10列 第一列 跨列7 剩余的平均分配 -->
      <table class="w-full">
        <tr
          v-for="(goods, index) in subOrderItem"
          :key="`${goods.sku_code}_${goods.goods_id}`"
          class="my-[10px]"
        >
          <td colspan="7" class="w-[70%] text-center">
            <div class="flex items-start h-100px">
              <kk-cld-image :src="goods.image" :width="80" :height="80" />
              <div class="flex-1 flex flex-col justify-start items-start">
                <div>{{ goods.goods_name }}</div>
                <div>{{ goods.sku_value }}</div>
              </div>
            </div>
          </td>
          <!-- 剩余3列平均分配：3个1列 -->
          <td colspan="1" class="w-[10%] text-center">
            <div class="flex flex-col justify-start items-center h-100px">
              <div>{{ goods.price }}</div>
              <div class="text-sm text-[#999]">x{{ goods.quantity }}</div>
            </div>
          </td>
          <td colspan="1" class="w-[10%] text-center" v-if="index === 0">
            <div class="h-100px">{{ goods.price }}</div>
          </td>
          <td
            colspan="1"
            rowspan="3"
            class="w-[10%] text-center"
            v-if="index === 0"
          >
            <div
              class="text-center"
              :class="`h-${subOrderItem.length * 100}px`"
            >
              <el-button type="primary">加入购物车</el-button>
              <el-button type="primary">查看详情</el-button>
              <el-button type="primary">取消订单</el-button>
              <el-button type="primary" @click="handlePayClick(subOrderItem)"
                >立即支付</el-button
              >
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import type { OrderItem } from "~~/server/api/orders/list.post";
const props = defineProps({
  orderMap: {
    type: Object as PropType<Record<string, OrderItem[]>>,
    default: () => {},
  },
});

function handlePayClick(subOrderItem: OrderItem[]) {
  console.log(subOrderItem);
}
</script>
