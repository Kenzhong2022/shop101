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
          <div class="p-10px w-full flex justify-center">
            <LazyKkSearch @search="handleSearch" class="flex-1"></LazyKkSearch>
          </div>
          <div class="flex-auto flex flex-col p-20px">
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
          <div class="flex-1">底部</div>
        </div>
      </template>
    </el-drawer>
    <el-dialog
      :modal="false"
      :modal-penetrable="true"
      v-model="chatRoomDialogVisible"
      title="Tips"
      width="500"
      draggable
      overflow
    >
      <template #header>聊天室</template>
      <template #default>
        <!-- 聊天室双方聊天内容 -->
        <div class="bg-[#ccc] p-10px">
          <div
            v-for="record in chatRecords"
            :key="record.seq"
            class="flex items-start mb-10px"
            :class="
              record.sender_id == curFd.id ? 'flex-row' : 'flex-row-reverse'
            "
          >
            <!-- 头像（对方蓝色，我红色） -->
            <div
              class="w-40px h-40px rounded-full flex-shrink-0 overflow-hidden"
              :class="
                record.sender_id == curFd.id ? 'bg-blue-500' : 'bg-red-500'
              "
            >
              <!-- 后期替真实头像 -->
              <img v-if="false" :src="avatarUrl(record.sender_id)" />
            </div>

            <!-- 消息气泡 -->
            <div
              class="mx-10px px-12px py-6px rounded-8px max-w-60% break-words"
              :class="
                record.sender_id == curFd.id
                  ? 'bg-white text-black'
                  : 'bg-green-500 text-white'
              "
            >
              {{ record.body }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <!-- 用户输入部分 -->
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 组合式 API 代码
import { ref, onMounted } from "#imports";
import { ChatRecords } from "~/api/Friends-api";

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

// 定义聊天记录列表
const chatRecords = ref([]);
const curFd = ref(null);
// 定义聊天弹窗状态
const chatRoomDialogVisible = ref(true);
// 定义方法：handleClickFd
const handleClickFd = (fd) => {
  console.log("点击好友", fd);
  // 记录当前点击的好友
  curFd.value = fd;
  console.log("curFd.value", typeof curFd.value.id);
  //打开聊天弹窗
  chatRoomDialogVisible.value = true;
  // 根据点击的好友拉取聊天记录
  const params = {
    friendId: fd.id,
  };
  // 调用获取好友聊天记录接口
  ChatRecords(params).then((res) => {
    console.log("获取好友聊天记录结果", res.list);
    chatRecords.value = res.list || [];
  });
};
</script>

<style></style>
