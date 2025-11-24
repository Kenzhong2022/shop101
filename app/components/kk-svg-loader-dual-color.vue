<template>
  <!-- 
    双色圆环版本
    主要修改：
    1. 添加了两个半圆环，使用不同的颜色
    2. 使用stroke-dasharray="125.6 125.6"创建半圆效果
    3. 两个圆环旋转方向相反，创造更丰富的视觉效果
    4. 支持CSS变量自定义颜色
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 400 300"
    :class="customClass"
    :style="cssVariables"
  >
    <!-- 渐变背景 -->
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #f8f9fa; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #e9ecef; stop-opacity: 1" />
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" fill="url(#bgGradient)" />

    <!-- 加载动画组 -->
    <g transform="translate(200, 150)">
      <!-- 蓝色半圆环（顺时针）-->
      <!-- stroke-dasharray="141.3 141.3" 半圆：周长/2 -->
      <circle
        cx="0"
        cy="0"
        r="45"
        fill="none"
        :stroke="outerRingColor"
        stroke-width="6"
        stroke-dasharray="141.3 141.3"
        stroke-dashoffset="0"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="2s"
          repeatCount="indefinite"
          easing="linear"
        />
      </circle>

      <!-- 红色半圆环（逆时针）-->
      <!-- stroke-dasharray="109.9 109.9" 小半圆 -->
      <!-- stroke-dashoffset="109.9" 偏移半个圆周，创建间隔 -->
      <circle
        cx="0"
        cy="0"
        r="35"
        fill="none"
        :stroke="primaryColor"
        stroke-width="6"
        stroke-dasharray="109.9 109.9"
        stroke-dashoffset="109.9"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 0 0"
          to="0 0 0"
          dur="1.5s"
          repeatCount="indefinite"
          easing="linear"
        />
      </circle>

      <!-- 中心加载文字 -->
      <text
        x="0"
        y="120"
        font-family="Arial, sans-serif"
        font-size="12"
        :fill="textColor"
        text-anchor="middle"
        font-weight="600"
      >
        {{ loadingText }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
  loadingText?: string;
  customClass?: string;
  primaryColor?: string;
  outerRingColor?: string;
  bgColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  loadingText: "双色加载中...",
  customClass: "",
  primaryColor: "var(--el-color-primary, #dc3545)",
  outerRingColor: "var(--el-color-primary-light-5, #007bff)",
  bgColor: "var(--el-color-primary-light-9, #f8f9fa)",
  textColor: "var(--el-color-primary, #495057)",
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
</script>

<style scoped>
svg {
  display: block;
  margin: 0 auto;

  /* 使用CSS变量作为后备方案 */
  --loader-primary: var(--el-color-primary, #dc3545);
  --loader-outer-ring: var(--el-color-primary-light-5, #007bff);
  --loader-bg: var(--el-color-primary-light-9, #f8f9fa);
  --loader-text: var(--el-color-primary, #495057);
}

/* 主题色支持 */
:deep(.el-color-primary) {
  --loader-primary: var(--el-color-primary);
  --loader-outer-ring: var(--el-color-primary-light-5);
  --loader-bg: var(--el-color-primary-light-9);
  --loader-text: var(--el-color-primary);
}
</style>
