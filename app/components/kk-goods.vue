/** * 商品组件 */
<template>
  <el-card
    :shadow="shadowMode"
    class="flex-1 text-4 min-w-200px"
    @mouseenter="shadowMode = 'always'"
    @mouseleave="shadowMode = 'never'"
  >
    <div class="flex-4 overflow-auto">
      <kk-cld-image :src="image" alt="商品图片" />
    </div>
    <div>商品顶部标题：模拟标题查看效果</div>
    <div>商品内容:价格信息，交易数量，发货地</div>
    <div>商品底部信息：店铺名</div>
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: "商品",
  },
  image: {
    type: String,
    default: "good_1_w3mjkm.webp",
  },
});

const shadowMode = ref<"never" | "always" | "hover">("never");
</script>

<style scoped lang="scss">
.el-card {
  margin-bottom: 20px;
}
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}
</style>
