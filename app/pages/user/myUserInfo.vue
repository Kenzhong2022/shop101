<!-- 我的用户信息 -->
<template>
  <div>我的用户信息</div>
</template>

<script setup lang="ts">
const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});
</script>
