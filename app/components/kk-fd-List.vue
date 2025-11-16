/** * 好友列表：添加好友，点击好友聊天 */
<template>
  <el-drawer
    :modal="true"
    :resizable="allowResize"
    :model-value="drawer"
    @update:model-value="handleDrawerUpdate"
    class="fd-drawer w-full"
    :size="drawerWidth"
    direction="rtl"
  >
    <template #header>
      <div
        class="flex-1 flex flex-row justify-between items-center hover:cursor-pointer"
      >
        <div
          class="flex items-center hover:text-primary"
          @click="handleDrawerUpdate(false)"
        >
          {{ isMobile.value ? "返回首页" : "关闭好友列表" }}
          <i
            class="iconfont icon-back text-primary"
            :style="{ fontSize: '20px' }"
          ></i>
        </div>
        <div class="flex items-center">
          好友列表
          <i
            class="iconfont icon-category text-primary"
            :style="{ fontSize: '20px' }"
          ></i>
        </div>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col h-full">
        <div class="flex flex-col">
          <div class="p-10px">
            <LazyKkSearch @search="handleSearch"></LazyKkSearch>
          </div>
        </div>
        <div class="flex-auto flex flex-col p-20px">
          <div
            v-for="fd in friendList"
            :key="fd.id"
            class="flex flex-row h-200px b-solid b-primary mb-10px p-20px box-border"
          >
            <el-image
              :src="'/icon头像1.webp'"
              class="h-100% rounded-full"
            ></el-image>
            <div class="flex flex-col justify-between">
              <div class="text-lg font-bold">用户名: {{ fd.username }}</div>
            </div>
          </div>
        </div>
        <div class="flex-1">底部</div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
// 组合式 API 代码
import { ref, onMounted } from "#imports";

// 引入搜索好友接口
import { searchFriends } from "~/api/Friends-api";

const props = defineProps({
  drawer: {
    type: Boolean,
    description: "是否显示好友列表抽屉",
  },
});
import { useMediaQuery, useElementSize } from "@vueuse/core";

// 响应式判断是否为移动端
const isMobile = useMediaQuery("(max-width: 768px)");
// 根据是否为移动端动态设置抽屉宽度
const drawerWidth = computed(() => (isMobile.value ? "100%" : "30%"));

// 2. 抽屉根节点（等 DOM 渲染完再挂）
const drawerEl = ref(null);

// 3. 实时宽高（宽高变化都会触发）
const { width: curDrawerWidth } = useElementSize(drawerEl);

// 4. 每次打开抽屉 → 等待渲染完成 → 把根节点挂到 drawerEl 上
watch(
  () => props.drawer,
  async (val) => {
    if (!val) return;
    await nextTick();
    // el-drawer 渲染后类名 .el-drawer 一定存在
    drawerEl.value = document.querySelector(".el-drawer");
  }
);

// 5. 如果你想根据宽度关闭 resizable
const allowResize = computed(() => {
  // 当抽屉宽度大于 520px 时，允许调整大小
  console.log("curDrawerWidth.value", curDrawerWidth.value);
  return curDrawerWidth.value > 520;
});

onMounted(() => {
  console.log("drawerWidth", drawerWidth.value);
});
const emit = defineEmits(["update:drawer"]);
// 3. 抽屉状态变化时，通知父组件更新值
const handleDrawerUpdate = (isOpen) => {
  console.log("抽屉状态变化", isOpen);
  // 触发 update:drawer 事件，将新状态（isOpen）传递给父组件
  emit("update:drawer", isOpen);
};

const friendList = ref([]);
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
  searchFriends(params).then((res) => {
    console.log("搜索好友结果", res.list);
    friendList.value = res.list || [];
  });

  // 处理搜索结果
  // ...
};
</script>

<style></style>
