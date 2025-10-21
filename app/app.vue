<template>
  <div>
    <NuxtLayout>
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </div>
</template>

<script setup>
// 设置全局CSS变量
onMounted(() => {
  document.documentElement.style.setProperty('--global-color', '#4285f4');
  document.documentElement.style.setProperty('--global-font-size', '16px');
});
</script>
