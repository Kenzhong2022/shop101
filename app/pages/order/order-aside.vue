<template>
  <div class="flex flex-col gap-[20px]">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-row">
          <div>确认收货地址</div>
          <div class="ml-auto">新增收货地址</div>
        </div>
      </template>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <div class="bg-base rounded-lg p-5 max-w-[800px] mx-auto shadow-sm">
          <!-- 标题 -->
          <div class="text-lg font-semibold mb-5 pb-2 border-b border-gray-200">
            确认商品信息
          </div>

          <!-- 商品列表 -->
          <el-card
            class="mb-5"
            v-for="shopItem in order?.subOrders"
            :key="shopItem.orderNo"
          >
            <div class="text-main text-sm font-semibold mb-2">
              【店铺：{{ shopItem.shopName }}】
            </div>
            <div
              class="flex items-center py-2 border-b border-gray-200"
              v-for="item in shopItem.items"
              :key="item.goodsId"
            >
              <!-- 商品图 -->
              <div
                class="w-20 h-20 bg-gray-50 rounded-sm flex items-center justify-center text-gray-400 mr-4 relative"
              >
                <kk-cld-image
                  :width="100"
                  :height="100"
                  :src="item.image"
                  alt="商品图片"
                  class="w-full h-full object-cover rounded-sm"
                  v-if="item.image"
                />
                <span v-else>商品图</span>
              </div>
              <div class="flex-1">
                <div class="text-main text-sm mb-1">
                  {{ item.goodsName }}
                </div>
                <div class="text-empty text-xs mb-1">
                  SKU：{{ item.skuInfo }}
                </div>
                <div class="flex justify-between text-sm text-secondary">
                  <div>单价：{{ item.priceDisplay }}</div>
                  <div>数量：{{ item.quantity }}</div>
                  <div>小计：{{ item.totalDisplay }}</div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 其他信息 -->
          <div class="mb-4">
            <div class="text-empty text-xs my-1">配送信息：（暂无数据）</div>
            <div class="text-empty text-xs my-1">支付方式：（暂无数据）</div>
            <div class="text-empty text-xs my-1">优惠券：（暂无数据）</div>
            <div class="text-empty text-xs my-1">运费：（暂无数据）</div>
          </div>

          <!-- 实付金额 -->
          <div class="text-right text-lg font-semibold text-price mt-5">
            实付金额：￥{{ getTotalPrice(order?.subOrders || []) }}
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { OrderCreateResponse } from "~~/server/types/order";
type OrderData = OrderCreateResponse["data"];
definePageMeta({
  title: "订单确认",
  pageInfo: {
    requiresAuth: true,
  },
});
const props = defineProps({
  order: {
    type: Object as PropType<OrderData>,
    default: () => {},
  },
});

const remark = ref("");

function getTotalPrice(subOrders: OrderData["subOrders"]) {
  return subOrders.reduce(
    (acc, cur) =>
      acc +
      cur.items.reduce(
        (acc, item) => acc + Number(item.totalDisplay.replace("¥", "")),
        0,
      ),
    0,
  );
}
</script>
