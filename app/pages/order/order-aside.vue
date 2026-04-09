<template>
  <div class="flex flex-col gap-[20px]">
    <!-- 确认收货地址 -->
    <el-card shadow="never">
      <!-- 地址操作 -->
      <template #header>
        <div class="flex flex-row">
          <div>确认收货地址</div>
          <div
            class="ml-auto cursor-pointer text-sm hover:text-primary transition-colors"
            @click="handleAddAddress"
          >
            新增收货地址
          </div>
        </div>
      </template>
      <!-- 地址列表 -->
      <div class="flex flex-row flex-wrap gap-[10px] overflow-hidden h-fit">
        <div
          v-for="item in addressList.slice(
            0,
            isExpandAddress ? addressList.length : 3,
          )"
          :key="item.id"
          @click="handleSelectAddress(item)"
          class="rounded-lg min-w-[calc(33%-10px)] bg-[#F5F5F5] p-[10px] h-[100px] box-border flex flex-col justify-between cursor-pointer hover:bg-[#E5E5E5]"
          :class="{ 'border-primary border-2 border-solid': item.isChecked }"
        >
          <div class="text-xs">
            <el-tag v-if="item.is_default" type="primary" size="small"
              >默认</el-tag
            >
            {{ getAddressText(item) }}
          </div>
          <div class="text-sm font-400">{{ item.detail_address }}</div>
          <div class="text-xs">收件人名称：{{ item.recipient_name }}</div>
          <div class="text-xs">收件人电话：{{ item.recipient_phone }}</div>
        </div>
      </div>
      <!-- 地址展开收起 -->
      <div
        class="text-sm text-[#999] cursor-pointer"
        @click="handleExpandAddress"
      >
        {{ isExpandAddress ? "显示全部地址" : "收起全部地址" }}
        <el-icon>
          <ArrowDown v-if="!isExpandAddress" />
          <ArrowUp v-else />
        </el-icon>
      </div>
    </el-card>
    <!-- 商品信息 -->
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
            实付金额：<span class="text-primary"
              >￥{{ getTotalPrice(order?.subOrders || []) }}</span
            >
          </div>
        </div>
      </template>
    </el-card>
    <address-dialog ref="addressDialogRef" @refresh="getData"></address-dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import AddressDialog from "@/components/addressDialog.vue";
import { codeToText } from "element-china-area-data";

import type { OrderCreateResponse } from "~~/server/types/order";
import type { UserAddress } from "~~/server/types/user-address";
type OrderData = OrderCreateResponse["data"];
definePageMeta({
  title: "订单确认",
  pageInfo: {
    requiresAuth: true,
  },
});
const emit = defineEmits(["refreshAddressList", "selectAddress"]);

const props = defineProps({
  order: {
    type: Object as PropType<OrderData>,
    default: () => {},
  },
  addressList: {
    type: Array as PropType<UserAddress[]>,
    default: () => [],
  },
});

const addressDialogRef = ref<typeof AddressDialog>();

const handleAddAddress = () => {
  addressDialogRef.value?.handleOpen();
};
const handleSelectAddress = (address: UserAddress) => {
  console.log(address);
  emit("selectAddress", address);
};

const getData = () => {
  emit("refreshAddressList");
};

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
function getAddressText(address: UserAddress) {
  return `${codeToText[address.province_code]}${codeToText[address.city_code]}${codeToText[address.district_code]}`;
}
const isExpandAddress = ref(false);
function handleExpandAddress() {
  isExpandAddress.value = !isExpandAddress.value;
}
</script>
