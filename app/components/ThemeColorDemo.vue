<template>
  <div class="theme-color-demo p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4 color-main">主题色切换演示</h2>
    
    <p class="mb-4">当前主题色：<span class="font-semibold color-main">{{ currentThemeColor }}</span></p>
    
    <div class="mb-6">
      <p class="mb-2">点击下方颜色按钮切换主题色：</p>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="color in themeColors"
          :key="color"
          class="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
          :style="{ backgroundColor: color }"
          @click="changeThemeColor(color)"
          :title="color"
        ></button>
      </div>
    </div>
    
    <div class="mb-4">
      <p class="mb-2">自定义颜色：</p>
      <div class="flex gap-2 items-center">
        <input
          v-model="customColor"
          type="color"
          class="w-8 h-8 cursor-pointer"
          @input="changeThemeColor(customColor)"
        />
        <input
          v-model="customColor"
          type="text"
          placeholder="输入十六进制颜色值"
          class="px-3 py-1 border border-gray-300 rounded"
          @change="changeThemeColor(customColor)"
        />
      </div>
    </div>
    
    <div class="demo-elements">
      <p class="mb-2">主题色应用示例：</p>
      <div class="flex flex-col gap-2">
        <div class="h-4 w-full color-main bg-opacity-20 rounded"></div>
        <p class="color-main">这是应用了 color-main 类的文本</p>
        <button class="px-4 py-2 color-main border border-current rounded hover:bg-current hover:text-white transition-colors">
          这是应用了 color-main 类的按钮
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { KK_color } from '@/composables/utils';

// 当前主题色
const currentThemeColor = ref('#490EFF');

// 自定义颜色输入
const customColor = ref('#490EFF');

// 预设的主题色选项
const themeColors = [
  '#490EFF', // 蓝色（默认）
  '#FF6B35', // 橙色
  '#00DC82', // 绿色
  '#FF4D4F', // 红色
  '#722ED1', // 紫色
  '#1890FF', // 亮蓝色
  '#FAAD14', // 黄色
  '#13C2C2', // 青色
];

// 切换主题色
const changeThemeColor = (color: string) => {
  KK_color.changeMainColor(color);
  currentThemeColor.value = color;
  customColor.value = color;
};

// 组件挂载时更新当前主题色
onMounted(() => {
  const rootStyle = getComputedStyle(document.documentElement);
  const currentColor = rootStyle.getPropertyValue('--themeColor').trim();
  if (currentColor) {
    currentThemeColor.value = currentColor;
    customColor.value = currentColor;
  }
});
</script>

<style scoped>
.theme-color-demo {
  max-width: 500px;
  margin: 0 auto;
}

.demo-elements {
  margin-top: 1rem;
}
</style>