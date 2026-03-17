<template>
  <div class="min-h-screen w-full max-w-[600px] bg-gray-50 p-6 mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">
      {{ goodsName }}
    </h1>
    <!-- 规格选择区：动态渲染所有维度 -->
    <div
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6"
    >
      <div
        v-for="spec in specList"
        :key="spec.id"
        class="flex flex-col sm:flex-row sm:gap-4 gap-2"
      >
        <!-- 维度标题 -->
        <span
          class="sm:min-w-[80px] font-semibold text-gray-700 pt-2 text-sm sm:text-base"
        >
          {{ spec.name }}：
        </span>

        <!-- 选项按钮组 -->
        <div class="flex flex-row gap-3 flex-wrap flex-1">
          <button
            v-for="value in spec.values"
            :key="value.id"
            class="relative px-4 py-2 rounded-lg border-2 transition-all duration-200 min-w-[60px] overflow-hidden"
            :class="getButtonClasses(spec.code, value.code)"
            :disabled="isSpecDisabled(spec.code, value.code)"
            @click="handleSelect(spec.code, value.code)"
          >
            {{ value.name }}
            <!-- 售罄斜线标记 -->
            <span
              v-if="
                isSpecDisabled(spec.code, value.code) &&
                !isSelected(spec.code, value.code)
              "
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span class="w-[140%] h-[2px] bg-gray rotate-45 absolute"></span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 选中结果展示 -->
    <div class="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <!-- 未完成选择 -->
      <div v-if="!isComplete" class="text-gray-500 text-center py-4">
        <p class="text-lg font-medium">请选择完整规格</p>
        <p class="text-sm text-gray-400 mt-1">
          已选 {{ selectedCount }}/{{ dimensionCount }} 个维度
        </p>
      </div>

      <!-- 已完成选择 -->
      <div v-else-if="currentSku" class="space-y-4">
        <div
          class="flex items-center justify-between pb-4 border-b border-gray-100"
        >
          <span class="text-gray-600">已选规格</span>
          <span class="font-bold text-gray-800 text-lg">{{
            currentSkuDisplayName
          }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-600">价格</span>
          <span class="text-3xl font-bold text-red-600"
            >¥{{ currentSku.price }}</span
          >
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-600">库存</span>
          <span
            :class="
              currentSku.stock > 0
                ? 'text-green-600 font-bold'
                : 'text-red-500 font-bold'
            "
          >
            {{ currentSku.stock > 0 ? `${currentSku.stock} 件` : "缺货" }}
          </span>
        </div>

        <!-- 库存紧张提示 -->
        <div
          v-if="currentSku.stock > 0 && currentSku.stock <= 5"
          class="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg"
        >
          ⚠️ 库存紧张，仅剩 {{ currentSku.stock }} 件
        </div>

        <!-- 缺货提示 -->
        <div
          v-if="currentSku.stock === 0"
          class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
        >
          该规格暂时缺货，请选择其他规格组合
        </div>
      </div>

      <!-- 异常状态（理论上不会发生，防御性编程） -->
      <div v-else class="text-red-500 text-center py-4">
        未找到该规格组合的商品信息
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-6 flex gap-4">
      <button
        class="flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-blue-500/30 active:scale-95"
        :class="
          canPurchase
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-600/40'
            : 'bg-gray-400'
        "
        :disabled="!canPurchase"
        @click="addToCart"
      >
        {{ actionButtonText }}
      </button>
    </div>

    <!-- 调试信息（开发时可用，生产环境可删除） -->
    <div
      class="mt-6 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-600 space-y-1"
    >
      <p>
        <span class="font-bold">维度顺序：</span
        >{{ specKeys.join(" → ") || "加载中..." }}
      </p>
      <p>
        <span class="font-bold">已选值：</span>{{ JSON.stringify(selected) }}
      </p>
      <p><span class="font-bold">SKU键：</span>{{ currentSkuKey || "无" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import type {
  SpecValue,
  SpecDimension,
  SkuInfo,
} from "~~/server/api/goods/[id]/specs.get.ts";

const emit = defineEmits(["update:currentSku", "update:skuCode"]); // 2. 定义 emit
// ==========================================
// 数据初始化
// ==========================================

const props = defineProps<{
  specList: SpecDimension[];
  skuList: SkuInfo[];
  goodsName: string;
}>();

// ==========================================
// 计算属性：核心映射关系
// ==========================================

/** 动态维度ID数组（关键：从数据中提取，而非硬编码）可能的数据结构是 ["color", "size", "material"] */
const specKeys = computed(() => props.specList.map((spec) => spec.code));

/** 维度数量 */
const dimensionCount = computed(() => props.specList.length);

/** 库存映射表：sku.specs_hash 作为Key 找到对应的商品SKU信息 */
const findGoodsBySpecsHash = computed(() => {
  const map = new Map<string, SkuInfo>();
  props.skuList.forEach((sku) => {
    map.set(sku.specs_hash, sku);
  });
  return map;
});

/** 反向查找：规格值ID -> 显示名（用于展示当前选中项）可以通过color:red 来获取红色的显示名 */
const valueNameMap = computed(() => {
  const map = new Map<string, string>();
  props.specList.forEach((spec) => {
    spec.values.forEach((val) => {
      map.set(`${spec.code}:${val.code}`, val.name);
    });
  });
  return map;
});

// ==========================================
// 状态管理
// ==========================================

/** 当前选中状态：{ [dimensionId]: valueId } */
const selected = reactive<Record<string, string>>({});

/** 已选维度数量 */
const selectedCount = computed(() => {
  return specKeys.value.filter((key) => selected[key] !== undefined).length;
});

/** 是否选完所有维度 */
const isComplete = computed(() => selectedCount.value === dimensionCount.value);

/** 当前SKU的Key（如 "red|l|cotton"） */
const currentSkuKey = computed(() => {
  if (!isComplete.value) return "";
  return specKeys.value.map((key) => selected[key]).join("|");
});

/** 当前选中的SKU展示名称（如 "中国红 / L / 纯棉"）*/
const currentSkuDisplayName = computed(() => {
  // ❗️不再依赖 currentSku.value，避免循环引用
  if (!isComplete.value) return "";

  // 直接从 selected 状态和 valueNameMap 计算
  return specKeys.value
    .map((dimId) => {
      const valCode = selected[dimId];
      console.log("【当前选中的规格值ID】", dimId, valCode);
      return valueNameMap.value.get(`${dimId}:${valCode}`) || valCode;
    })
    .join(" / ");
});

/** 当前选中的SKU信息 */
const currentSku = computed(() => {
  if (!isComplete.value) return null;

  console.log("【当前选中的SKU Key】", currentSkuKey.value);

  const sku = findGoodsBySpecsHash.value.get(currentSkuKey.value);
  if (!sku) return null;

  // ✅ 现在可以安全地使用 currentSkuDisplayName.value，因为它是“上游”而非“下游”
  return {
    ...sku,
    sku_value: currentSkuDisplayName.value,
  };
});

/** 是否可以购买 */
const canPurchase = computed(() => {
  return isComplete.value && !!currentSku.value && currentSku.value.stock > 0;
});

/** 操作按钮文案 */
const actionButtonText = computed(() => {
  if (!isComplete.value)
    return `请选择规格 (${selectedCount.value}/${dimensionCount.value})`;
  if (currentSku.value?.stock === 0) return "暂时缺货";
  return "加入购物车";
});

// ==========================================
// 核心逻辑：联动禁用算法
// ==========================================

/** 判断是否已选中 */
function isSelected(dimId: string, valueId: string): boolean {
  return selected[dimId] === valueId;
}

/**
 * @param dimId 维度ID（如 "color"）
 * @param valueId 规格值ID（如 "red"）
 * 【核心算法】判断某个规格值是否应该被禁用
 * 逻辑：假设选中该值，检查是否存在任何SKU满足：
 * 1. 匹配当前所有已选规格（包括假设的这个）
 * 2. 库存 > 0
 */
function isSpecDisabled(dimId: string, valueId: string): boolean {
  console.log("【判断是否禁用】", dimId, valueId);
  // 已选中的不禁用（允许点击取消）
  if (isSelected(dimId, valueId)) return false;
  // 构造假设的选中状态
  const assumedSelection = { ...selected, [dimId]: valueId };
  // 检查是否存在有效SKU
  const hasValidSku = props.skuList.some((sku) => {
    // 检查该SKU是否匹配所有已选（含假设）的规格
    const isMatch = specKeys.value.every((key, index) => {
      const selectedVal = assumedSelection[key]; // 假设选中的规格值
      if (selectedVal === undefined) return true; // 该维度未选，通配：未选择的规格一定可以选，所以返回true
      console.log(
        "sku.specs[index],selectedVal",
        sku.specs[index],
        selectedVal,
      );
      return sku.specs[index] === selectedVal;
    });
    console.log("【匹配当前所有已选规格】", isMatch, sku.stock);
    return isMatch && sku.stock > 0;
  });

  // 意思是：如果假设选中该值后，不存在任何有效SKU，那么该值就应该被禁用
  return !hasValidSku;
}

/** 处理规格选择/取消 */
function handleSelect(dimId: string, valueId: string) {
  // 防御：如果已禁用且未选中，禁止操作
  if (isSpecDisabled(dimId, valueId) && !isSelected(dimId, valueId)) {
    return;
  }

  // 切换选中状态
  if (isSelected(dimId, valueId)) {
    delete selected[dimId]; // 取消选中
  } else {
    selected[dimId] = valueId; // 选中
  }
}

// ==========================================
// UI 辅助函数
// ==========================================

/** 获取按钮样式类 */
function getButtonClasses(dimId: string, valueId: string): string {
  const selected = isSelected(dimId, valueId);
  const disabled = isSpecDisabled(dimId, valueId);

  // 禁用状态（未选中时的禁用）
  if (disabled && !selected) {
    return "bg-#ccc text-gray-400 border-#ccc cursor-not-allowed cursor-not-allowed";
  }

  // 选中状态
  if (selected) {
    // 正常选中
    return "border-primary border-2 text-primary bg-#fff transform scale-115";
  }

  // 默认可选
  return "hover:border-primary hover:text-primary active:scale-95 bg-#fff border-#ccc";
}

/** 加入购物车 */
function addToCart() {
  if (!canPurchase.value) return;

  const sku = currentSku.value!;
  alert(
    `✅ 加入购物车成功！\n\n` +
      `规格：${currentSkuDisplayName.value}\n` +
      `价格：¥${sku.price}\n` +
      `库存：${sku.stock}件`,
  );
}

watchEffect(() => {
  if (currentSku.value) {
    console.log("【当前选中的currentSku】", currentSku.value);
    emit("update:currentSku", currentSku.value);
    // emit("update:skuCode", sku.code);
  }
});
</script>

<style scoped>
/* 额外的自定义样式补充 */
button {
  touch-action: manipulation; /* 优化移动端点击 */
  cursor: pointer;
  padding: 4px 12px;
  margin: 2px;
  border-radius: 8px;
  border-style: solid; /* 强制实线，无3D效果 */
}

/* 禁用状态的按钮点击反馈 */
button:disabled {
  transform: none !important;
  cursor: not-allowed;
}

/* 选中动画 */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

button:active::after {
  opacity: 1;
}
</style>
