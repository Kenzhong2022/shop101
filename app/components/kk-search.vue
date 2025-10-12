<template>
  <!-- 搜索组件 -->
  <div class="search min-w-[300px] w-450px position-relative">
    <el-input
      v-model="input"
      class="border-transparent w-full min-h-40px bg-#fff overflow-hidden"
      placeholder="Please input"
    ></el-input>
    <el-button type="primary" class="position-absolute right-4px"
      >Primary搜素</el-button
    >
  </div>
</template>

<script>
export default {
  name: "search",
  data() {
    return {
      input: "",
    };
  },
};
</script>

<style scoped lang="scss">
@use "sass:map";
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: transparent;
  overflow: hidden;
  // border-radius: var(--el-input-border-radius, var(--el-border-radius-base) 20px);
  :deep(.el-input__wrapper) {
    box-sizing: border-box;
    padding: 10px;
    background-color: #fff;
    // border-radius: var(
    //     --el-input-border-radius,
    //     var(--el-border-radius-base) 20px
    // ) !important;
    .el-input__inner {
      height: 15px;
    }
  }
}
</style>
