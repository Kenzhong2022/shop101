/** * 商品详情页 */
<template>
  <!-- 规格选择器模板 -->
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
/**
 * 规格组：类型数组 存对象
 * 对象中有两个key specType和specValues
 * key => specType：规格类型 比如【颜色】【尺码】
 * key => specValues：规格值数组对象 比如[{value：红色，isAvailable：false}，{value：绿色，isAvailable：false}，{value：黄色，isAvailable：false}]
 * isAvailable：是否可选
 */
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
  // 刷新按钮可否点击状态
  refreshAvailability();
}

/* ----------  库存联动核心  ---------- */
/**
 * 刷新按钮可否点击状态
 */
function refreshAvailability() {
  // 遍历规格组
  specGroups.value?.forEach((group) => {
    /**
     * 遍历当前规格值数组，根据选中的规格判断是否可选
     */
    group.specValues.forEach((specValue) => {
      //当前规格组的规格是否选中 同一个key 判断是否值相同 相同则可选
      if (selectedSpec[group.specType] === specValue.value) {
        specValue.isAvailable = true;
        return;
      }

      let keyValueObj = { [group.specType]: specValue.value };
      // 合并当前选中的规格和当前遍历的规格值对象 同一个key 后续添加的值会覆盖前面选择的规格
      keyValueObj = { ...selectedSpec, ...keyValueObj };
      console.log("Object.entries(keyValueObj):", keyValueObj);
      console.log("Object.entries(keyValueObj):", Object.entries(keyValueObj));
      // 当前遍历的规格值对象是否可选 只要有一个符合条件的sku 那么当前规格值可选
      specValue.isAvailable = skuList.value.some((sku) => {
        // 把对象转数组 方便遍历 Object.entries(keyValueObj) 二维数组 每个元素是一个数组 数组第一个元素是key 第二个元素是value
        const keyValueArr = Object.entries(keyValueObj);
        const flag = keyValueArr.every(([t, val]) => {
          if (!sku.spec_json[t]) return false; // 如果当前sku 没有这个规格项 那么直接返回false
          if (sku.stock <= 0) return false; // 如果当前sku 库存小于等于0 那么直接返回false
          return sku.spec_json[t] === val; // 每个规格项都要匹配 才能证明有这个款的商品
        });
        return flag;
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
