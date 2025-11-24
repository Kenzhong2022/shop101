<template>
  <div class="relative w-200px h-200px rounded-full b-solid">
    <div class="conic-spin absolute z-99 top-0 left-0"></div>
    <div class="conic-spin-bg absolute z-999 top-0 left-0"></div>
  </div>
</template>

<script setup lang="ts">
// Radar scanning animation component
// Features: rotating conic gradients, concentric circles, crosshair lines
</script>

<style scoped>
.conic-spin {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 保持圆形 */
  /* 背景叠加：径向渐变（深浅控制）+ 圆锥渐变（扇形分布） */
  background:
    /* 1. 径向渐变：从圆心（深色）到边缘（浅色）（核心反转） */ radial-gradient(
      circle,
      /* 保持圆形径向渐变（贴合元素） */ rgb(255, 248, 42) 0%,
      /* 圆心：不透明绿色（最深） */ rgba(0, 105, 0, 0.5) 30%,
      /* 30%半径处：深绿色（透明度20%） */ rgba(0, 0, 0, 1) 70%,
      /* 70%半径处：浅绿色（透明度60%） */ rgba(0, 0, 0, 1) 100%
        /* 边缘：极浅绿色（透明度90%，最浅） */
    ),
    /* 2. 圆锥渐变保持不变（控制扇形分布） */
      conic-gradient(
        transparent 0deg,
        transparent 300deg,
        green 300deg,
        green 360deg
      );
  animation: spin 1.5s linear infinite; /* 保持原有旋转动画 */
}

.conic-spin-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  /* 背景叠加：5个同心圆 + XY 轴（新增） */
  background-image:
    /* 1-5：原有5个空心同心圆（保持不变） */ radial-gradient(
      circle at center,
      transparent 0 8%,
      rgba(0, 255, 0, 0.3) 8% 10%,
      transparent 10% 100%
    ),
    radial-gradient(
      circle at center,
      transparent 0 23%,
      rgba(0, 255, 0, 0.3) 23% 25%,
      transparent 25% 100%
    ),
    radial-gradient(
      circle at center,
      transparent 0 38%,
      rgba(0, 255, 0, 0.3) 38% 40%,
      transparent 40% 100%
    ),
    radial-gradient(
      circle at center,
      transparent 0 53%,
      rgba(0, 255, 0, 0.3) 53% 55%,
      transparent 55% 100%
    ),
    radial-gradient(
      circle at center,
      transparent 0 68%,
      rgba(0, 255, 0, 0.3) 68% 70%,
      transparent 70% 100%
    );

  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

.conic-spin-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 保持圆形 */
  /* 背景叠加：径向渐变（深浅控制）+ 圆锥渐变（扇形分布） */
  background:
    /* 2. 原有圆锥渐变：控制透明扇形和绿色扇形的分布（分界清晰） */ conic-gradient(
    black 0deg,
    black 300deg,
    /* 0~300deg：透明扇形（占5/6圆） */ transparent 300deg,
    transparent 360deg /* 300~360deg：绿色扇形（占1/6圆） */
  );
  animation: spin 1.5s linear infinite; /* 保持原有旋转动画 */
}

.conic-spin-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  /* 背景叠加：5个同心圆 + XY 轴（新增） */
  background-image:/* 新增：X轴（水平轴线）- 中心交叉点=圆心 */ linear-gradient(
      to right,
      /* 水平方向（左→右） */ transparent 0 49.8%,
      /* 左半部分透明（占49.8%） */ rgba(0, 255, 0, 1) 49.8% 50%,
      /* 中间0.2%宽度为轴线（粗细） */ transparent 50% 100%
        /* 右半部分透明（占49.8%） */
    ),
    /* 新增：Y轴（垂直轴线）- 中心交叉点=圆心 */
      linear-gradient(
        to bottom,
        /* 垂直方向（上→下） */ transparent 0 49.8%,
        /* 上半部分透明（占49.8%） */ rgba(0, 255, 0, 1) 49.8% 50%,
        /* 中间0.2%宽度为轴线（粗细） */ transparent 50% 100%
          /* 下半部分透明（占49.8%） */
      ),
    linear-gradient(
      45deg,
      transparent 0 49.8%,
      rgba(0, 255, 0, 1) 49.8% 50%,
      transparent 50% 100%
    ),
    linear-gradient(
      to bottom right,
      transparent 0 49.8%,
      rgba(0, 255, 0, 1) 49.8% 50%,
      transparent 50% 100%
    );

  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  /* 伪元素单独动画：逆时针旋转，速度更快 */
  animation: reverse-spin 1.5s linear infinite;
}

/* 伪元素的独立动画 */
@keyframes reverse-spin {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

/* 旋转动画（原有逻辑不变） */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
