<template>
  <div class="w-100% aspect-ratio-1/1">
    <!-- 商品展示组件 -->
    <div class="relative w-800px m-auto">
      <div
        class="w-full h-[64px] bg-red flex items-center justify-start gap-[12px]"
      >
        <div class="w-32px h-32px bg-blue">
          <el-avatar
            :src="props.image"
            :size="32"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex flex-row justify-center items-center bg-green">
          <div>店家名</div>
          <div>店家评分</div>
          <div>店家粉丝数</div>
        </div>
      </div>
      <kk-cld-image
        v-if="props.image"
        :src="props.image"
        :width="800"
        :height="800"
        gravity="auto"
        crop="fill"
      >
        <template #default>
          <!-- 遮罩层 大小100px * 100px:左上角坐标跟随鼠标移动 -->
          <div
            v-if="props.image"
            class="absolute w-100 h-100 bg-black opacity-50"
            :style="{ top: `${mouseY}px`, left: `${mouseX}px` }"
          ></div>
        </template>
      </kk-cld-image>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  goodsName: string;
  image: string;
}>();
const mouseX = ref(0);
const mouseY = ref(0);
// 鼠标移动事件
const mouseMove = (e: MouseEvent) => {
  const { clientX, clientY } = e;
  // 计算遮罩层左上角坐标
  const maskX = clientX - 50;
  const maskY = clientY - 50;
  // 更新遮罩层位置
  mouseX.value = maskX;
  mouseY.value = maskY;
};
</script>

<style scoped lang="scss">
:deep(.kk-cld-image-wrapper) {
  border-radius: 100px;
  overflow: hidden;
}
</style>
