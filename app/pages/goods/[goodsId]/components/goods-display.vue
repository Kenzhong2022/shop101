<template>
  <div class="w-100% aspect-ratio-1/1">
    <!-- 商品展示组件 -->
    <div class="relative w-800px m-auto">
      <!-- 商家店铺信息展示 -->
      <store-info
        :image="props.image"
        :shop_name="'kk商铺'"
        :rating="4.5"
        :fans="1000"
      />
      <div class="w-fit m-auto">
        <kk-cld-image
          v-if="props.image"
          :src="props.image"
          :width="600"
          :height="600"
          :radius="20"
          gravity="auto"
          crop="fill"
          class="goods-image"
        >
          <template #default>
            <!-- 遮罩层 大小100px * 100px:左上角坐标跟随鼠标移动 -->
            <div
              v-if="false"
              class="absolute w-100 h-100 bg-black opacity-50"
              :style="{ top: `${mouseY}px`, left: `${mouseX}px` }"
            ></div>
          </template>
        </kk-cld-image>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import storeInfo from "./store-info.vue";
const props = defineProps<{
  goodsName: string;
  image: string;
  shop_name?: string;
  rating?: number;
  fans?: number;
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

<style scoped lang="scss"></style>
