<template>
  <!-- 搜索组件 -->
  <div class="search min-w-[300px] position-relative">
    <el-input
      v-model="input"
      class="border-transparent w-full min-h-40px bg-#fff overflow-hidden"
      placeholder="Please input"
    >
      <template #prefix>
        <el-button type="primary" class="min-h-40px" @click="handleSearch">
          <el-icon class="text-#fff">
            <Search />
          </el-icon>
          搜索
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";

const input = ref("");

// 定义事件：search
const emit = defineEmits(["search"]);

// 定义方法：handleSearch
const handleSearch = () => {
  // 触发事件：search
  emit("search", input.value);
};
</script>

<style scoped lang="scss">
@use "sass:map";
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: transparent;

  :deep(.el-input__wrapper) {
    box-sizing: border-box;
    padding: 10px;
    background-color: #fff;
    border-width: 2px !important;
    /* 语法：水平偏移 垂直偏移 模糊半径 扩散半径 颜色 （内阴影用inset） */
    /* box-shadow: [inset] <水平偏移> <垂直偏移> <模糊半径> <扩散半径> <颜色>;*/
  }
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset !important;
  }

  :deep(.el-input__inner) {
    height: 100%; // 可调整为 auto，让输入框自动适配文字高度
    line-height: 100%;
    font-size: 18px;
  }
}
</style>
