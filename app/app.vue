<template>
  <div class="app-bg">
    <kk-color-picker @change="handleColorChange" />

    <NuxtLayout>
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 引入全局 CSS 变量函数
import { setThemeColor } from "@/plugins/global-css-vars.client";

const color = ref("");

// 处理颜色选择变化
function handleColorChange(newHsl: string) {
  color.value = newHsl;
  console.log("即将转换主题色:", newHsl);
  if (process.client) {
    setThemeColor(newHsl);
  }
}
</script>

<style lang="scss">
.app-bg {
  background-color: color-mix(
    in srgb-linear,
    #fff 80%,
    var(--el-color-primary, #fff)
  );
}
</style>
