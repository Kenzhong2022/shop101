<template>
  <!-- 搜索组件 -->
  <div
    class="search position-relative flex-auto box-border mx-auto mb-20px mt-10px"
  >
    <el-input
      v-model="input"
      class="border-transparent w-full bg-#fff overflow-hidden"
      placeholder="Please input"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <div v-debounce:[800]="handleSearch">
          <el-button type="primary">
            <el-icon class="text-#fff">
              <Search />
            </el-icon>
            搜索
          </el-button>
        </div>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";

const input = ref("");

// 定义事件：search
const emit = defineEmits(["search"]);

/**
 * 搜索方法
 * @description 当用户点击搜索按钮时，触发搜索事件，将输入框中的值作为搜索关键词。并且清空输入框。
 */
const handleSearch = () => {
  if (input.value.trim()) {
    // 跳转到搜索列表页，带搜索参数
    navigateTo({
      path: "/searchList",
      query: { keyword: input.value.trim() },
    });
  }
  // 清空输入框
  input.value = "";
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
    box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
  }
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 2px var(--el-color-primary-light-5) inset !important;
  }

  :deep(.el-input__inner) {
    height: 100%; // 可调整为 auto，让输入框自动适配文字高度
    line-height: 100%;
    font-size: 18px;
  }
}
</style>
