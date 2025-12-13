/** * 商品详情页 */
<template>
  <!-- 规格选择器模板 -->
  <div class="detail-container flex justify-start relative">
    <div class="w-full h-1200px bg-red"></div>
    <div
      class="flex-1 h-100vh w-200px bg-green overflow-auto absolute top-0 right-0"
    >
      <div v-for="i in 120" class="h-120px">{{ i }}</div>
    </div>
  </div>
  <div>
    <div v-for="group in specGroups" :key="group.specType" class="spec-row">
      <span>{{ group.specType }}：</span>
      <button
        v-for="item in group.specValues"
        :key="item.value"
        :disabled="!item.isAvailable"
        :class="{ active: selectedSpec[group.specType] === item.value }"
        @click="handleSelect(group.specType, item.value)"
      >
        {{ item.value }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiGoodsSku } from "~/api/goods";
import type { SkuListResponse } from "~~/server/api/goods/sku.post";

/* --------------------  数据  -------------------- */
const skuData = ref<SkuListResponse["data"]>();
/** 当前选中的规格 { 颜色:'黑色', 尺码:'M' } */
const selectedSpec = reactive<Record<string, string>>({});

/* --------------------  计算属性  -------------------- */
/** 用来渲染按钮的规格组（会动态更新 isAvailable） */
const specGroups = computed(() => skuData.value?.specGroups || []);
/** 扁平的库存 SKU 列表 */
const skuList = computed(() => skuData.value?.skuList || []);

/* --------------------  初始化  -------------------- */
const route = useRoute();
onMounted(async () => {
  const goodsId = Number(route.params.goodsId);
  if (!goodsId) return;
  const res = await apiGoodsSku({ goods_id: goodsId });
  skuData.value = res.data;
  // 初始化可用性
  refreshAvailability();
});

/* ----------  选中 / 取消  ---------- */
function handleSelect(specType: string, specValue: string) {
  // 选中 or 取消
  if (selectedSpec[specType] === specValue) {
    delete selectedSpec[specType];
  } else {
    selectedSpec[specType] = specValue;
  }

  // 全部取消 → 所有按钮恢复可用
  if (Object.keys(selectedSpec).length === 0) {
    specGroups.value?.forEach((g) =>
      g.specValues.forEach((v) => (v.isAvailable = true))
    );
    return;
  }
  // 否则重新计算
  refreshAvailability();
}

/* ----------  库存联动核心  ---------- */
function refreshAvailability() {
  specGroups.value?.forEach((group) => {
    // 当前规格key：比如【颜色】
    // forEach遍历颜色的值数组 [{红色，isAvailable：false}，{绿色，isAvailable：false}，{黄色，isAvailable：false}]
    group.specValues.forEach((specValue) => {
      // 若选中的对象中 用当前的key 找到对应的值 和 当前的的值一致 直接改 isAvailable
      if (selectedSpec[group.specType] === specValue.value) {
        specValue.isAvailable = true;
        // console.log("【refreshAvailability】已选中，永远可点:", specValue);
        return;
      }
      // 若是未选中的比如黄色，那么查看 加入到临时对象中。
      let keyValueObj = { [group.specType]: specValue.value };
      // console.log("【refreshAvailability】keyValueObj:", keyValueObj);
      // console.log("selectedSpec:", {
      //   ...selectedSpec,
      // });
      keyValueObj = { ...selectedSpec, ...keyValueObj };
      console.log("Object.entries(keyValueObj):", Object.entries(keyValueObj));
      specValue.isAvailable = skuList.value.some((sku) => {
        if (
          Object.entries(keyValueObj).every(([t, val]) => {
            return sku.spec_json[t] === val; // 每个规格项都要匹配 才能证明有这个款的商品
          })
        ) {
          return sku.stock > 0;
        }
      });
    });
    console.log("=".repeat(30));
  });
}
</script>

<style scoped>
button {
  margin: 4px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

/* 蓝色高亮当前选中 */
button.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

/* 库存不足灰色禁用 */
button:disabled {
  background: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}
</style>
