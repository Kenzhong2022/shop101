<!-- 浏览历史 -->
<template>
  <div>浏览历史</div>
</template>

<script setup lang="ts">
// 页面元信息配置
// 这里可以添加更多路由元信息，用于路由守卫判断
definePageMeta({
  title: "浏览历史",
  layout: "default",
  pageInfo: {
    requiresAuth: true, // 标记需要认证
  },
});
</script>