<template>
  <!-- 
    脉冲缩放版本
    主要修改：
    1. 使用animateTransform的type="scale"创建缩放动画
    2. 使用animate创建透明度动画
    3. 多个圆环错开动画时间，创造波浪效果
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 400 300"
    :class="customClass"
  >
    <!-- 深色背景 -->
    <rect width="100%" height="100%" fill="#2c3e50" />

    <!-- 加载动画组 -->
    <g transform="translate(200, 150)">
      <!-- 外层脉冲圆环 -->
      <!-- stroke-dasharray="314.2" 完整圆周 -->
      <!-- stroke-dashoffset="78.5" 1/4缺口 -->
      <circle
        cx="0"
        cy="0"
        r="50"
        fill="none"
        stroke="#3498db"
        stroke-width="3"
        stroke-dasharray="314.2"
        stroke-dashoffset="78.5"
        stroke-linecap="round"
      >
        <!-- 缩放动画 -->
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.2;1"
          dur="2s"
          repeatCount="indefinite"
          easing="ease-in-out"
        />
        <!-- 透明度动画 -->
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      <!-- 中层脉冲圆环（延迟）-->
      <!-- stroke-dashoffset="55" 1/4缺口 -->
      <!-- begin="0.5s" 延迟0.5秒开始 -->
      <circle
        cx="0"
        cy="0"
        r="35"
        fill="none"
        stroke="#e74c3c"
        stroke-width="4"
        stroke-dasharray="219.9"
        stroke-dashoffset="55"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.3;1"
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
          easing="ease-in-out"
        />
        <animate
          attributeName="opacity"
          values="0.2;0.8;0.2"
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>

      <!-- 内层脉冲圆环（更延迟）-->
      <!-- stroke-dashoffset="31.4" 1/4缺口 -->
      <!-- begin="1s" 延迟1秒开始 -->
      <circle
        cx="0"
        cy="0"
        r="20"
        fill="none"
        stroke="#2ecc71"
        stroke-width="5"
        stroke-dasharray="125.7"
        stroke-dashoffset="31.4"
        stroke-linecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.4;1"
          dur="2s"
          begin="1s"
          repeatCount="indefinite"
          easing="ease-in-out"
        />
        <animate
          attributeName="opacity"
          values="0.1;0.6;0.1"
          dur="2s"
          begin="1s"
          repeatCount="indefinite"
        />
      </circle>

      <!-- 中心静态圆点 -->
      <circle cx="0" cy="0" r="8" fill="#ecf0f1" />

      <!-- 脉冲加载文字 -->
      <text
        x="0"
        y="130"
        font-family="Arial, sans-serif"
        font-size="16"
        fill="#ecf0f1"
        text-anchor="middle"
        font-weight="500"
      >
        {{ loadingText }}
        <!-- 文字脉冲动画 -->
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1.5s"
          repeatCount="indefinite"
        />
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
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  loadingText: "脉冲加载中...",
  customClass: "",
});
</script>

<style scoped>
svg {
  display: block;
  margin: 0 auto;
}
</style>
