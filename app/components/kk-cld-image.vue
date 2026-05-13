/** * 自定义 Cloudinary 图片组件 url前缀固定
https://res.cloudinary.com/dlji1nmdj/image/upload/v1763887762 */
<template>
  <!-- CldImage 组件 -->
  <div
    ref="wrapper"
    class="kk-cld-image-wrapper relative overflow-hidden"
    :class="{ 'rounded-full': isAvatar }"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      '--img-radius': isAvatar ? '50%' : radius + 'px',
    }"
  >
    <!-- 客户端渲染 -->
    <client-only>
      <NuxtImg
        :src="fullSrc"
        :width="width"
        :height="height"
        :alt="alt"
        :priority="priority"
        :quality="quality"
        :gravity="gravity"
        :crop="crop"
        loading="lazy"
      />
      <!-- 具名插槽：默认插槽 -->
      <slot></slot>
    </client-only>
    <!-- 加载器 -->
    <kk-svg-loader-fast
      v-if="isLoading"
      :width="width"
      :height="height"
      class="absolute top-0"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    default: "",
    required: true,
  },
  width: {
    type: Number,
    default: 300,
    required: true,
  },
  height: {
    type: Number,
    default: 400,
    required: true,
  },
  alt: {
    type: String,
    default: "默认alt",
  },
  priority: {
    type: Boolean,
    default: false,
  },
  quality: {
    type: Number,
    default: 80,
  },
  gravity: {
    type: String,
    default: "auto",
  },
  crop: {
    type: String,
    default: "auto_pad",
  },
  isAvatar: {
    type: Boolean,
    default: false,
  },
  radius: {
    type: Number,
    default: 0,
    validator: (val: number) => {
      if (val < 0) {
        throw new Error("radius 必须大于等于 0 ");
      }
      return true;
    },
  },
});
const isLoading = ref(true);
// 定义 emits 选项
const emits = defineEmits(["load", "error"]);
//拼接传递过来的src 前缀
const prefix = "https://res.cloudinary.com/dlji1nmdj/image/upload/v1763887762/";
// 拼接完整的图片 url
const fullSrc = computed(() => prefix + props.src);
onMounted(() => {
  if (props.src) {
    isLoading.value = false;
  }
});
</script>

<style scoped lang="scss">
.kk-cld-image-wrapper {
  border-radius: var(--img-radius);
}
</style>
