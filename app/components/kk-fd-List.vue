/** * 好友列表：添加好友，点击好友聊天 */
<template>
  <div class="fd-list flex flex-col">
    <div class="">
      <LazyKkSearch @search="handleSearch"></LazyKkSearch>
    </div>
    <div class="flex-auto">显示结果部分</div>
    <div class="flex-1">底部</div>
  </div>
</template>

<script setup>
// 组合式 API 代码
import { ref, onMounted } from "#imports";

// 引入搜索好友接口
import { searchFriends } from "~/api/Friends-api";

// 定义方法：handleSearch
const handleSearch = (val) => {
  // .trim() 方法移除字符串首尾的空格
  val = val.trim();
  console.log("搜索参数", val);
  // 搜索好友
  const params = {
    keyword: val,
  };
  // 调用搜索好友接口
  searchFriends(params);

  // 处理搜索结果
  // ...
};
</script>

<style scoped>
.fd-list {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  height: 100%;
  padding-left: 20px;
  background: #fff;
  width: 20%; /* 电脑端宽度30% */
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1); /* 左侧阴影效果 */
}

/* 手机端响应式：宽度100% */
@media (max-width: 768px) {
  .fd-list {
    width: 100%;
  }
}
</style>
