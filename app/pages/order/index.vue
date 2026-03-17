/** * 提交订单 */
<template>
  <div class="order p-[20px] flex flex-row justify-between gap-[20px]">
    <!-- 左侧确认信息 -->
    <order-aside class="flex-1" />
    <!-- 右侧提交订单操作 -->
    <order-actions class="flex-1" />
  </div>
</template>
<script setup lang="ts">
import OrderAside from "./order-aside.vue";
import OrderActions from "./order-actions.vue";

definePageMeta({ name: "order" });
</script>
