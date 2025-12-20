/** * 好友列表：添加好友，点击好友聊天 */
<template>
  <div>
    <!-- 好友列表抽屉:关闭遮罩层，可以穿透遮罩层点击抽屉外的内容 -->
    <el-drawer
      :modal="false"
      :modal-penetrable="true"
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
            {{ isMobile ? "返回首页" : "关闭好友列表" }}
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
      <!-- 好友列表 -->
      <template #default>
        <div class="flex flex-col h-full">
          <div class="flex-1 p-10px w-full flex justify-center">
            <LazyKkSearch @search="handleSearch" class="flex-1"></LazyKkSearch>
          </div>
          <h4>测试滚动功能</h4>
          <el-scrollbar height="500px">
            <div class="flex-auto flex flex-col p-20px">
              <!-- 一位好友 -->
              <div
                v-for="fd in friendList"
                :key="fd.id"
                class="flex flex-row h-200px b-solid b-primary mb-10px p-20px box-border hover:cursor-pointer"
                @click="handleClickFd(fd)"
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
          </el-scrollbar>
          <div class="bg-#ccc">底部</div>
        </div>
      </template>
    </el-drawer>

    <!-- 聊天室弹窗 -->
    <kk-fd-chatRoom
      ref="chatRoomRef"
      :curFd="curFd"
      :curRoomID="curRoomID"
      :isMobile="isMobile"
      @close="handleCloseChatRoom"
      :chatRecords="chatRecords"
    />
  </div>
</template>

<script setup>
import { ChatRecords } from "~/api/Friends-api";
import { useUser } from "~/composables/useUser";
const userState = useUser();
const chatRoomRef = ref(null);
/**
 * @description 关闭聊天弹窗，断开连接
 */
function handleCloseChatRoom() {
  chatRoomRef.value.close();
}

// 引入搜索好友接口
import { searchFriends } from "~/api/Friends-api";
import { useElementSize } from "@vueuse/core";

//父组件传递的抽屉状态
const props = defineProps({
  drawer: {
    type: Boolean,
    description: "是否显示好友列表抽屉",
  },
});

// 参数2 就是 SSR 时的默认值
const isMobile = ref(false);
// 1. 先给“占位值”
const ssrWidth = "30%";
const drawerWidth = ref(ssrWidth);

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
    // el-drawer 渲染后类名 .el-drawer 一定存在 （抽屉打开时）就可以获取到 抽屉根节点
    drawerEl.value = document.querySelector(".el-drawer");
    handleSearch("");
  }
);

// 5. 如果你想根据宽度关闭 resizable
const allowResize = computed(() => {
  //宽度可调整但 当前宽度与可视窗口的比例不能小于30%
  console.log("curDrawerWidth.value", curDrawerWidth.value);
  return curDrawerWidth.value >= 380;
});

const setWidth = () => {
  console.log("设置抽屉宽度");
  drawerWidth.value = mql.matches ? "100%" : "30%";
};
let mql = null;
onMounted(() => {
  mql = window.matchMedia("(max-width: 768px)");
  // console.log("mql", mql);
  isMobile.value = mql.matches;
  setWidth(); // 第一次
  mql.addEventListener("change", setWidth); // 窗口大小变化也更新
});

/**
 * 抽屉状态变化时，通知父组件更新值
 */
const emit = defineEmits(["update:drawer"]);
/**
 * 更新抽屉状态
 * @param isOpen 抽屉是否打开
 * @description 更新抽屉状态，通知父组件抽屉是否打开
 */
const handleDrawerUpdate = (isOpen) => {
  console.log("抽屉状态变化", isOpen);
  // 触发 update:drawer 事件，将新状态（isOpen）传递给父组件
  emit("update:drawer", isOpen);
};
const friendList = ref([]);
/**
 * 搜索好友
 * @param val 搜索关键词
 * @description 搜索好友，根据关键词查询好友列表 赋值给 friendList
 */
const handleSearch = (val) => {
  // .trim() 方法移除字符串首尾的空格
  val = val.trim();
  console.log("搜索参数", val);
  // 搜索好友
  const params = {
    keyword: val,
    userId: userState.value.user_id,
  };
  // 调用搜索好友接口
  searchFriends(params).then((res) => {
    console.log("搜索好友结果", res.list);
    friendList.value = res.list || [];
  });
};

// 定义聊天记录列表
const chatRecords = ref([]);

// 定义当前点击的好友
const curFd = ref(null);
// 定义当前聊天房间ID
const curRoomID = ref(null);

/**
 * 点击好友，打开聊天弹窗，拉取聊天记录，连接到服务器
 * @param fd 点击的好友
 * @description 点击好友，打开聊天弹窗，拉取聊天记录，连接到服务器
 */
const handleClickFd = (fd) => {
  // 记录当前点击的好友
  curFd.value = fd;
  // 调用获取好友聊天记录接口
  ChatRecords({
    friendId: fd.id,
  }).then((res) => {
    chatRecords.value = res.list || [];
    curRoomID.value = Number(chatRecords.value[0].room_id);
    chatRoomRef.value.open();
  });
};

/* 组件卸载时统一解绑, 避免内存泄漏 */
onBeforeUnmount(() => {
  mql.removeEventListener("change", setWidth);
});
</script>
