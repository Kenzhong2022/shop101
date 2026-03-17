<template>
  <div class="flex flex-col gap-[20px]">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-row">
          <div>确认收货地址</div>
          <div class="ml-auto">新增收货地址</div>
        </div>
      </template>
    </el-card>
    <el-card shadow="never">
      <template #header> 确认商品信息 </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
</script>
