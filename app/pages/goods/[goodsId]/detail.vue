/** * 商品详情页 */
<template>
  <div class="flex">
    <goods-main :goods-name="goodsName" :image="image"></goods-main>
    <!-- 商品aside left-50% 居中 -translate-x-1/2 使得坐标轴不是中心 而是左边框 减去300px是600的一半 -->
    <goods-aside
      class="fixed left-[calc(50%+800px-600px/2-16px-24px)] -translate-x-1/2 w-[600px] z-999"
      :style="{
        top: (scrollY < 65 ? 65 - Math.floor(scrollY) : 0) + 'px',
      }"
      :goods-name="goodsName"
      :spec-list="specList"
      :sku-list="skuList"
      @update:currentSku="(skuObj) => (currentSku = skuObj)"
      @update:skuCode="(code) => (skuCode = code)"
    />
    <goods-operation
      :goods-id="Number(goodsId)"
      :currentSku="currentSku"
      :sku-code="skuCode"
    />
  </div>
</template>

<script setup lang="ts">
import { useScroll } from "@/composables/useScroll";

import GoodsMain from "./components/goods-main.vue";
import GoodsAside from "./components/goods-aside.vue";
import GoodsOperation from "./components/goods-operation.vue";

import { apiGoodsSpecs } from "@/api/goods";
import type {
  SpecValue,
  SpecDimension,
  SkuInfo,
} from "~~/server/types/goods-specs";
import { useProductBehavior } from "~/composables/useProductBehavior";
const { scrollY, scrollX } = useScroll(); // 监听滚动事件 得到y轴距离0 的滚动距离
const goodsId = useRoute().params.goodsId as string | number;
// ==========================================
// 数据初始化
// ==========================================
const specList = ref<SpecDimension[]>([]); // 规格维度列表（从后端获取）
const skuList = ref<SkuInfo[]>([]); // 扁平的库存 SKU 列表（从后端获取）
const image = ref<string>(""); // 商品图片（从后端获取）
const goodsName = ref<string>(""); // 商品名称（从后端获取）
const currentSku = ref<SkuInfo>({} as SkuInfo); // 当前选中的规格名称
const skuCode = ref<string>(""); // 当前选中的规格编码

let durationInterval: any = null; // 用于清理定时器
let sessionStartTime: number | null = null; // 当前段开始时间
let totalDuration = 0; // 累计有效时长（毫秒）

// 启动计时（恢复）
const startTimer = () => {
  if (durationInterval) return;

  sessionStartTime = Date.now(); // 记录当前段开始

  durationInterval = setInterval(() => {
    console.log("已浏览:", getCurrentDuration() / 1000, "秒");
  }, 1000);
};

// 停止计时（暂停并结算）
const stopTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }

  // 结算当前段到累计时长
  if (sessionStartTime) {
    totalDuration += Date.now() - sessionStartTime;
    sessionStartTime = null;
  }
};

// 获取当前总时长（累计 + 当前段）
function getCurrentDuration() {
  const currentSession = sessionStartTime ? Date.now() - sessionStartTime : 0;
  return totalDuration + currentSession;
}

// 传给 useProductBehavior
const { track } = useProductBehavior(goodsId, {
  behaviorType: "view",
  getDuration: getCurrentDuration, // 关键：传入获取函数
}) as { track: () => void };
// 加载商品数据（只在首次执行）
const loadGoodsData = async () => {
  const { data } = await apiGoodsSpecs(Number(goodsId));
  goodsName.value = data.goods_name;
  image.value = data.image;
  skuList.value = data.skus;
  specList.value = data.dimensions;
};

// ==========================================
// 生命周期钩子
// ==========================================
// 首次挂载：加载数据
onMounted(async () => {
  await loadGoodsData();
});
onActivated(() => {
  console.log("组件激活，启动定时器");
  startTimer(); // 恢复计时
});

onDeactivated(() => {
  console.log("组件被缓存（停用），停止定时器");
  stopTimer(); // 暂停并结算
  track(); // 上报（此时 getDuration 返回累计时长）
});

// 卸载时（组件被销毁）：清理
onUnmounted(() => {
  console.log("🔴 GOODS DETAIL UNMOUNTED!");
  stopTimer();
});
</script>

<style scoped></style>
