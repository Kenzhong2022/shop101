/** * 自定义 Cloudinary 图片组件 url前缀固定
https://res.cloudinary.com/dlji1nmdj/image/upload/v1763887762 */
<template>
  <!-- CldImage 组件 -->
  <div
    ref="wrapper"
    class="relative"
    :style="{ width: `${width}`, height: `${height}` }"
  >
    <!-- 客户端渲染 -->
    <client-only>
      <CldImage
        :src="fullSrc"
        :width="width"
        :height="height"
        :alt="alt"
        :priority="priority"
        :quality="quality"
        :gravity="gravity"
        :crop="crop"
      />
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
    default: 400,
  },
  height: {
    type: Number,
    default: 400,
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
    default: "",
  },
  crop: {
    type: String,
    default: "",
  },
});
const isLoading = ref(true);
// 定义 emits 选项
const emits = defineEmits(["load", "error"]);
//拼接传递过来的src 前缀
const prefix = "https://res.cloudinary.com/dlji1nmdj/image/upload/v1763887762/";
// 拼接完整的图片 url
const fullSrc = computed(() => prefix + props.src);
const wrapper = ref<HTMLDivElement>();
onMounted(() => {
  if (props.src) {
    isLoading.value = false;
  }

  const parent = wrapper.value!.parentElement;
  if (parent) {
    console.log("父元素宽高：", parent.offsetWidth, parent.offsetHeight);
  }
});
</script>
