<!-- pages/index.vue -->
<template>
  <div class="container">
    <h1>Nuxt 3 全局防抖指令示例</h1>

    <!-- 基础用法：默认 500ms 防抖 -->
    <button v-debounce="handleClick">基础防抖（500ms）</button>

    <!-- 自定义延迟：1秒防抖 -->
    <button v-debounce:[1000]="handleLongClick" class="mt-4">
      长延迟防抖（1秒）
    </button>

    <!-- 带参数的回调 -->
    <button v-debounce:[800]="(e) => handleWithParam(e, 'Nuxt 3')" class="mt-4">
      带参数防抖
    </button>
  </div>
</template>

<script setup>
// 业务逻辑（无需关心指令注册，直接使用）
const handleClick = () => {
  console.log("Nuxt 3 基础防抖触发");
};

const handleLongClick = () => {
  console.log("Nuxt 3 长延迟防抖触发");
};

const handleWithParam = (e, msg) => {
  console.log("Nuxt 3 带参数防抖：", msg);
  console.log("事件对象：", e);
};
</script>

<style scoped>
.container {
  padding: 2rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
