<script setup>
defineProps({
  width: {
    type: String,
    default: "50px", // 默认宽度
    validator: (value) => {
      return /^\d+px$/.test(value); // 验证是否为像素值
    }, // 验证宽度是否为像素值
  },
  backgroundColor: {
    type: String,
    required: true, // 背景颜色为必填项
  },
});
</script>

<template>
  <div class="box" :style="boxStyles"></div>
</template>

<style scoped lang="scss">
.box {
  --w: v-bind(width); // 使用v-bind绑定宽度
  position: relative;
  width: var(--w);
  height: var(--w);
  background-color: initial; // 绑定背景颜色
  border-radius: 50%;
  overflow: hidden;

  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--w)); // 根据宽度调整大小
    height: calc(var(--w));
    background-color: #ccc;
    animation: rotate360 2s linear infinite;
    transform-origin: top left;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(var(--w) * 0.8);
    height: calc(var(--w) * 0.8);
    border-radius: inherit;
    background-color: v-bind(backgroundColor);
  }
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
