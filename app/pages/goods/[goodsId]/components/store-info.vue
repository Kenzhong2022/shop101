<template>
  <div class="w-full flex items-start justify-start gap-[12px] p-[12px]">
    <kk-cld-image
      :src="'1764060353981'"
      :width="100"
      :height="100"
      :radius="10"
      class="w-full h-full object-cover store-icon"
    />
    <div class="flex flex-col justify-start items-start">
      <div>店家名 {{ props.shop_name }}</div>
      <div>店家评分 <el-rate v-model="props.rating" /></div>
      <div>店家粉丝数 {{ props.fans }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string;
  shop_name: string;
  rating: number;
  fans: number;
}>();
</script>

<style scoped lang="scss">
:deep(.kk-cld-image-wrapper) {
  overflow: hidden;
}
</style>
