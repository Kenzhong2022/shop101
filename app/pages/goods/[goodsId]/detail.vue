/** * 商品详情页 */
<template>
  <!-- 规格选择器模板 -->
  <div>
    {{ skuData }}
    {{ availableSpecs }}
    <div v-for="group in availableSpecs" :key="group.specType" class="spec-row">
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

// 商品sku接口的数据
const skuData = ref<SkuListResponse["data"]>();
let selectedSpec = <Record<string, string>>{}; // 格式：{ 规格类型: 选中值 }，如 { 颜色: "黑色" }
const route = useRoute();
onMounted(async () => {
  const goodsId = Number(route.params.goodsId);
  if (!goodsId) return;
  const res = await apiGoodsSku({ goods_id: goodsId });
  skuData.value = res.data;
  updateAvailableSpecs();
});

// 处理规格选中/取消
function handleSelect(specType: string, specValue: string) {
  // 示例：specType=颜色，specValue=黑色
  if (selectedSpec[specType] === specValue) {
    // 点击已选中的规格 → 取消选中（如再次点击黑色，移除颜色选中状态）
    delete selectedSpec[specType];
  } else {
    // 选中新规格 → 更新状态（如点击黑色，selectedSpec = { 颜色: "黑色" }）
    selectedSpec[specType] = specValue;
  }

  // 关键：选中后重新计算“可用规格”，并更新UI（下一步实现）
  updateAvailableSpecs();
}

// 存储可用规格（格式和specGroups一致，标记哪些选项可用）
let availableSpecs = [...(skuData.value?.specGroups || [])] as {
  specType: string;
  specValues: {
    value: string;
    isAvailable: boolean;
  }[];
}[]; // 初始为所有规格都可用

// 计算可用规格的核心函数
function updateAvailableSpecs() {
  // 1. 把skuMap转成数组（方便遍历）
  const skuList = Object.values(skuData.value?.skuMap || {});

  // 2. 筛选出“包含已选中规格 + 库存>0”的有效SKU
  const validSkus = skuList.filter((sku) => {
    // 2.1 检查当前SKU是否包含所有已选中的规格（如已选黑色，SKU颜色必须是黑色）
    let isMatchSelected = true;
    for (const [type, value] of Object.entries(selectedSpec)) {
      // sku.spec_json 是规格对象（如 { 颜色: "黑色", 尺码: "S" }）
      if (sku.spec_json[type] !== value) {
        isMatchSelected = false; // 不匹配已选中规格，排除该SKU
        break;
      }
    }
    // 2.2 同时满足：匹配已选中规格 + 库存>0 → 有效SKU
    return isMatchSelected && sku.stock > 0;
  });

  // 3. 从有效SKU中，提取每个规格类型的可用选项
  const availableOptions = {} as Record<string, string[]>; // 格式：{ 颜色: ["黑色", "白色"], 尺码: ["S", "XL"] }
  (skuData.value?.specGroups || []).forEach((group) => {
    const specType = group.specType;
    // 提取所有有效SKU中，当前规格类型的所有值（去重）
    const options = [
      ...new Set(validSkus.map((sku) => sku.spec_json[specType])),
    ];
    availableOptions[specType] = options as string[];
  });

  // 4. 更新availableSpecs（标记每个选项是否可用）
  availableSpecs = (skuData.value?.specGroups || []).map((group) => {
    const specType = group.specType;
    return {
      specType: specType,
      specValues: group.specValues.map((value) => ({
        value: value.value,
        // 可用条件：该选项在availableOptions中存在
        isAvailable: availableOptions[specType]?.includes(
          value.value
        ) as boolean,
      })),
    };
  });
  watchEffect(() => {
    // 2. 当前已选规格
    console.log("[selectedSpec]已选择规格：", selectedSpec);

    //转换数据结构 ：把 skuMap 转成数组（方便遍历）
    const skuList = Object.values(skuData.value?.skuMap || {});
    // 3. 计算后得到的“有效 SKU”
    const validSkus = skuList.filter((sku) => {
      let allMatched = true; // 假设当前sku符合所有已选规格
      for (const [type, val] of Object.entries(selectedSpec)) {
        if (sku.spec_json[type] !== val) {
          allMatched = false; // 有一个规格不匹配，当前sku不符合已选规格
          break;
        }
      }
      // 4. 检查库存是否充足 若充足则返回true 保留该sku
      return allMatched && sku.stock > 0;
    });
    console.log("[validSkus]", validSkus);

    // 4. 每个规格类型当前可用的值
    const availableOptions: Record<string, string[]> = {};
    skuData.value?.specGroups.forEach((g) => {
      availableOptions[g.specType] = [
        ...new Set(
          validSkus.map((s) => s.spec_json[g.specType]).filter(Boolean)
        ),
      ] as string[];
    });
    console.log("[availableOptions]", availableOptions);

    // 5. 最终拿来渲染的 availableSpecs
    const final = (skuData.value?.specGroups || []).map((g) => ({
      specType: g.specType,
      specValues: g.specValues.map((v) => ({
        value: v.value,
        isAvailable: availableOptions[g.specType]?.includes(v.value) ?? false,
      })),
    }));
    console.log("[availableSpecs]", final);
  });
}
</script>
