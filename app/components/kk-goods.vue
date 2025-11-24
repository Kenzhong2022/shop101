/** * 商品组件 */
<template>
  <div
    :shadow="shadowMode"
    class="flex-1 text-4 min-w-200px aspect-ratio-3/4 b-solid b-1 b-#ccc p-5"
    :class="{ 'shadow-lg': shadowMode === 'always' }"
    @mouseenter="shadowMode = 'always'"
    @mouseleave="shadowMode = 'never'"
  >
    <div class="flex-4 overflow-auto" ref="imgRef">
      <!-- 加载动画 -->
      <kk-svg-loader-fast v-if="loading" :width="200" :height="300" />
      <kk-cld-image v-else :src="goods.image" alt="商品图片" />
    </div>
    <div>商品顶部标题：{{ goods.title }}</div>
    <div>商品内容:价格信息，交易数量，发货地</div>
    <div>商品底部信息：店铺名</div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
const props = defineProps({
  title: {
    type: String,
    default: "商品",
  },
  image: {
    type: String,
    default: "good_1_w3mjkm.webp",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  goods: {
    type: Object,
    default: () => ({}),
  },
});

const shadowMode = ref<"never" | "always" | "hover">("never");
/* 拿到 el-card 的 DOM */
const imgRef = ref<HTMLElement>();
/* 实时宽高 */
const { width: w, height: h } = useElementSize(imgRef);
onMounted(async () => {
  await nextTick();
  console.log("宽高：", w.value, h.value);
});
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
