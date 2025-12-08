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

// 商品sku接口的数据
const skuData = ref<SkuListResponse["data"]>();
let selectedSpec = <Record<string, string>>{}; // 格式：{ 规格类型: 选中值 }，如 { 颜色: "黑色" }
// 用于渲染，供用户选择的规格组，每次用户选择之后都会更新该数据里的isAvailable
const specGroups = computed(() => {
  return skuData.value?.specGroups || [];
});

const skuList = computed(() => {
  return skuData.value?.skuList || [];
});

const route = useRoute();
onMounted(async () => {
  const goodsId = Number(route.params.goodsId);
  if (!goodsId) return;
  const res = await apiGoodsSku({ goods_id: goodsId });
  skuData.value = res.data;
  console.log("[skuData]商品sku数据", skuData.value);
});

/**
 * 处理规格选中/取消
 * @param specType 规格类型
 * @param specValue 规格值
 */
function handleSelect(specType: string, specValue: string) {
  // 示例：specType=颜色，specValue=黑色
  if (selectedSpec[specType] === specValue) {
    // 点击已选中的规格 → 取消选中（如再次点击黑色，移除颜色选中状态）
    delete selectedSpec[specType];
    console.log("取消选中", specType, specValue);
    //selectedSpec 为空 说明用户取消了所有的规格选择
    if (Object.keys(selectedSpec).length === 0) {
      skuData.value?.specGroups.forEach((group) => {
        group.specValues.forEach((item) => {
          item.isAvailable = true;
        });
      });
    }
  } else {
    // 选中新规格 → 更新状态（如点击黑色，selectedSpec = { 颜色: "黑色" }）
    selectedSpec[specType] = specValue;
  }
  console.log("[selectedSpec]选中的规格", selectedSpec);
  //先排除掉库存为0的sku
  const tempSkuList: Record<string, string>[] = skuList.value
    .filter((item) => {
      if (item.stock <= 0) return false;
      return true;
    })
    .map((item) => item.spec_json);
  console.log("[tempSkuList]所有符合库存的sku", tempSkuList);
  if (!tempSkuList) return;

  // 再根据用户选择的规格，筛选出所有符合条件的sku
  const matchSkuList = tempSkuList.filter((item) => {
    // 遍历用户选择的规格，判断是否完全match
    let isMatch = true;
    for (const key in selectedSpec) {
      if (item[key] !== selectedSpec[key]) {
        isMatch = false;
        break;
      }
    }
    // true 保留，false 排除
    return isMatch;
  });
  console.log("当前选择的规格完全match的sku", matchSkuList);
  skuData.value?.specGroups.forEach((group) => {
    // console.log("当前规格组", group);
    //遍历当前规格尺寸 可选的所有选择 S M L
    group.specValues.forEach((item) => {
      item.isAvailable = matchSkuList.some(
        // 遍历 若matchSkuList 中的规格type的值 等于 当前规格type的值 代表当前规格可选 则isAvailable 为 true
        (sku) => sku[group.specType] === item.value
      );
    });
  });
}
</script>
