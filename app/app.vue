<template>
  <div class="app-bg">
    <NuxtLayout>
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
/* 基础字体：适配大部分屏幕（1vw ≈ 3.75px 在375px手机上，1vw≈19.2px 在1920px电脑上） */
body {
  font-size: 1.1vw; /* 基础字体大小，可根据需求调整比例 */
  line-height: 1.6; /* 行高随字体同步缩放，保证可读性 */
}

/* 标题字体：按比例放大，同样用vw */
h1 {
  font-size: 2.5vw;
}
h2 {
  font-size: 1.8vw;
}

/* 媒体查询：限制字体最小/最大值（关键！避免极端情况） */
@media (max-width: 768px) {
  /* 手机等小屏幕 */
  body {
    font-size: 14px; /* 最小字体，防止过窄屏幕字体过小 */
  }
  h1 {
    font-size: 28px;
  }
  h2 {
    font-size: 22px;
  }
}

@media (min-width: 1920px) {
  /* 电脑大屏（如2K/4K屏） */
  body {
    font-size: 18px; /* 最大字体，防止过宽屏幕字体过大 */
  }
  h1 {
    font-size: 36px;
  }
  h2 {
    font-size: 28px;
  }
}

body {
  box-sizing: border-box;
}

.app-bg {
  background-color: color-mix(
    in srgb-linear,
    #fff 80%,
    var(--el-color-primary, #fff)
  );
}
</style>
