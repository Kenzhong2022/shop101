<template>
  <!-- 
    快速旋转版本
    主要修改：
    1. animateTransform的dur从1.5s改为0.5s（更快）
    2. stroke-dashoffset从62.8改为125.6（缺口更大）
    3. stroke-width从4改为6（更粗的线条）
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    :class="customClass"
    :style="cssVariables"
  >
    <!-- 背景层 -->
    <rect width="100%" height="100%" :fill="bgColor" />

    <!-- 加载动画组 -->
    <g :transform="`translate(${width / 2}, ${height / 2})`">
      <!-- 外层虚线圆环 -->
      <circle
        cx="0"
        cy="0"
        r="40"
        fill="none"
        :stroke="outerRingColor"
        stroke-width="2"
        stroke-dasharray="251.2"
        stroke-dashoffset="0"
      />

      <!-- 快速旋转的内圆环 -->
      <!-- stroke-width="6" 更粗的线条 -->
      <!-- stroke-dashoffset="125.6" 更大的缺口，约50% -->
      <!-- dur="0.5s" 更快的旋转速度 -->
      <circle
        cx="0"
        cy="0"
        r="40"
        fill="none"
        :stroke="primaryColor"
        stroke-width="6"
        stroke-dasharray="251.2"
        stroke-dashoffset="125.6"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="0.5s"
          repeatCount="indefinite"
          easing="linear"
        />
      </circle>

      <!-- 中心文字 -->
      <text
        x="0"
        :y="textY"
        font-family="Arial, sans-serif"
        font-size="12"
        :fill="textColor"
        text-anchor="middle"
        font-weight="bold"
      >
        {{ loadingText }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
// 定义 props 选项
const props = defineProps({
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 200,
  },
  loadingText: {
    type: String,
    default: "快速加载中...",
  },
  customClass: {
    type: String,
    default: "",
  },
  primaryColor: {
    type: String,
    default: "var(--el-color-primary, #1e90ff)",
  },
  outerRingColor: {
    type: String,
    default: "var(--el-color-primary-light-5, #87ceeb)",
  },
  bgColor: {
    type: String,
    default: "var(--el-color-primary-light-9, #f0f8ff)",
  },
  textColor: {
    type: String,
    default: "var(--el-color-primary, #1e90ff)",
  },
});

/**
 * 计算CSS变量
 * 允许动态绑定颜色值到SVG元素
 */
const cssVariables = computed(() => ({
  "--loader-primary": props.primaryColor,
  "--loader-outer-ring": props.outerRingColor,
  "--loader-bg": props.bgColor,
  "--loader-text": props.textColor,
}));

const textY = computed(() => 80 + 12 + 4); // 2r + fontSize + gap
</script>

<style scoped>
svg {
  display: block;
  margin: 0 auto;

  /* 使用CSS变量作为后备方案 */
  --loader-primary: var(--el-color-primary, #1e90ff);
  --loader-outer-ring: var(--el-color-primary-light-5, #87ceeb);
  --loader-bg: var(--el-color-primary-light-9, #f0f8ff);
  --loader-text: var(--el-color-primary, #1e90ff);
}

/* 主题色支持 */
:deep(.el-color-primary) {
  --loader-primary: var(--el-color-primary);
  --loader-outer-ring: var(--el-color-primary-light-5);
  --loader-bg: var(--el-color-primary-light-9);
  --loader-text: var(--el-color-primary);
}
</style>
