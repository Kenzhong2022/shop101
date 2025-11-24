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

    <!-- 聊天弹窗 -->
    <el-dialog
      class="chat-room-dialog"
      :modal="false"
      :modal-penetrable="true"
      v-model="chatRoomDialogVisible"
      title="Tips"
      :width="isMobile ? '100%' : '800px'"
      draggable
      @close="handleCloseChatRoomDialog"
    >
      <template #header>
        <header class="text-center text-2xl font-bold">
          {{ curFd.username }}{{ userState.user_id }}
        </header>
      </template>
      <template #default>
        <!-- 聊天室双方聊天内容 -->
        <div class="bg-[#ccc] p-10px">
          <el-scrollbar height="500px" ref="scrollbarRef">
            <div
              v-for="record in chatRecords"
              :key="record.seq"
              class="flex items-center mb-10px min-h-100px"
              :class="
                record.sender_id == curFd.id ? 'flex-row' : 'flex-row-reverse'
              "
            >
              <!-- 头像（对方蓝色，我红色） -->
              <div
                class="h-100px rounded-full flex-shrink-0 overflow-hidden aspect-ratio-[1/1]"
                :class="
                  record.sender_id == curFd.id ? 'bg-blue-500' : 'bg-red-500'
                "
              >
                <!-- 后期替真实头像 -->
                <!-- <img v-if="false" :src="avatarUrl(record.sender_id)" /> -->
                <el-image v-if="true" src="/icon头像1.webp" />
              </div>

              <!-- 消息气泡 -->
              <div
                class="mx-10px px-12px py-6px rounded-8px h-100% max-w-60% break-words"
                :class="
                  record.sender_id == curFd.id
                    ? 'bg-white text-black'
                    : 'bg-green-500 text-white'
                "
              >
                {{ record.body }}
              </div>
            </div>
          </el-scrollbar>
        </div>
      </template>
      <template #footer>
        <!-- 用户输入部分 -->
        <div class="flex flex-row gap-2px">
          <!-- 输入框点击enter 发送消息 -->
          <el-input
            v-model="inputMessage"
            @keyup.enter="handleSendMessage"
            placeholder="请输入消息"
          ></el-input>
          <el-button type="primary" @click="handleSendMessage">发送</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 组合式 API 代码
import { ref, onMounted } from "#imports";
import { ChatRecords } from "~/api/Friends-api";
import formatTime from "~/composables/tools";
import { useUser, getCurrentUser } from "~/composables/useUser";
const userState = useUser(); // 关键：加括号调用

// 调试：监听用户状态变化
watchEffect(() => {
  console.log("[kk-fd-List] 用户状态变化:", {
    user_id: userState.value.user_id,
    token: userState.value.token,
  });
});

// 调试：获取当前用户信息
onMounted(() => {
  console.log("[kk-fd-List] 组件挂载时用户信息:", getCurrentUser());
});

// 引入搜索好友接口
import { searchFriends } from "~/api/Friends-api";

import { socket } from "./socket"; // 引入 socket 实例
// 状态管理
const isConnected = ref(socket.connected);
// 传输方式
const transport = ref(
  socket.connected ? socket.io.engine.transport.name : "N/A"
);

//父组件传递的抽屉状态
const props = defineProps({
  drawer: {
    type: Boolean,
    description: "是否显示好友列表抽屉",
  },
});
import { useMediaQuery, useElementSize } from "@vueuse/core";

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
const scrollbarRef = ref(null);
const setWidth = () => {
  console.log("设置抽屉宽度");
  drawerWidth.value = mql.matches ? "100%" : "30%";
};
let mql = null;
onMounted(() => {
  mql = window.matchMedia("(max-width: 768px)");
  console.log("mql", mql);
  isMobile.value = mql.matches;
  setWidth(); // 第一次
  mql.addEventListener("change", setWidth); // 窗口大小变化也更新
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
    userId: userState.value.user_id,
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
watch(
  () => chatRecords.value,
  (newVal) => {
    if (newVal.length > 0) {
      console.log("聊天记录发生了变化");
      // 等待滚动条渲染完成
      nextTick(() => {
        // 滚动到最新消息
        scrollbarRef.value.setScrollTop(9999999);
      });
    }
  }
);
// 定义当前点击的好友
const curFd = ref(null);

// 定义聊天弹窗状态
const chatRoomDialogVisible = ref(false);
/**
 * @description 点击好友，打开聊天弹窗，拉取聊天记录，连接到服务器
 * @param fd 点击的好友
 */
const handleClickFd = (fd) => {
  console.log("点击好友", fd);
  // 记录当前点击的好友
  curFd.value = fd;
  // 根据点击的好友拉取聊天记录
  const params = {
    friendId: fd.id,
  };
  // 调用获取好友聊天记录接口
  ChatRecords(params).then((res) => {
    console.log("获取好友聊天记录结果", res.list);
    chatRecords.value = res.list || [];
    //打开聊天弹窗
    chatRoomDialogVisible.value = true;

    // 连接到服务器
    socket.connect();
    // 等待滚动条渲染完成
    nextTick(() => {
      // 滚动到最新消息
      scrollbarRef.value.setScrollTop(9999999);
    });
  });
};

// 定义用户输入消息
const inputMessage = ref("");
// 定义方法：handleSendMessage
const handleSendMessage = () => {
  console.log("发送消息", inputMessage.value);
  const msg = inputMessage.value;
  // 校验用户输入
  if (!msg.trim()) {
    // ElMessage({
    //   message: "请输入消息",
    //   type: "warning",
    //   // 持续时间 2s
    //   duration: 2000,
    //   // 居中显示
    //   center: true,
    //   appendTo: document.querySelector(".chat-room-dialog"),
    // });
    const { $message } = useNuxtApp();
    $message.warning("请输入消息");
    return;
  }
  console.log("last_read_seq", chatRecords?.value[0].seq);
  // 构建参数
  const payload = {
    roomId: Number(chatRecords?.value[0]?.room_id) || -1,
    sender_id: Number(userState.value.user_id) || -1,
    msg_type: 1,
    body: msg,
    // 格式化时间戳
    update_at: formatTime(new Date(), {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    }),
    last_read_seq: chatRecords.value[chatRecords.value.length - 1].seq || -1,
  };
  ElMessage({
    message: `发送成功:${payload.body}用户id是：${payload.sender_id}`,
    type: "success",
  });
  console.log("payload", payload);
  // emit 事件（发送消息到服务端）
  socket.emit("chat", payload);
  // 清空输入框
  inputMessage.value = "";
};

// 连接成功回调
function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;
  console.log("连接成功");
  // 监听传输方式切换（如polling升级为websocket）
  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
  // 加入房间
  socket.emit("join", 1);
}

/**
 * @description 关闭聊天弹窗，断开连接
 */
const handleCloseChatRoomDialog = () => {
  console.log("关闭聊天弹窗");
  // 关闭弹窗
  chatRoomDialogVisible.value = false;
  // 断开连接
  socket.disconnect();
};

// 断开连接回调
function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

/* 监听服务端广播 */
function onChat(payload) {
  console.log("【客户端】收到服务端广播:", payload);
  // push 到聊天记录列表
  chatRecords.value = [...chatRecords.value, payload];
}

function onServerTime({ msg, time }) {
  console.log(`[${time}] ${msg}`);
}

// 监听服务器问候事件
function onHello(greeting) {
  console.log("【客户端】收到服务器问候:", greeting);
}

// 绑定事件 （连接成功、断开、自定义事件）
socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);
socket.on("chat", onChat);
socket.on("hello", onHello); // 监听服务器问候事件

/* 组件卸载时统一解绑, 避免内存泄漏 */
onBeforeUnmount(() => {
  mql.removeEventListener("change", setWidth);

  console.log("[ws] 组件卸载时解绑事件");
  // 解绑事件
  socket.off("connect", onConnect);
  // 解绑断开事件
  socket.off("disconnect", onDisconnect);
  // 解绑自定义事件
  socket.off("chat", onChat);
  // 解绑服务端时间事件
  socket.off("serverTime", onServerTime);
  // 解绑问候事件
  socket.off("hello", onHello);
});
</script>

<style></style>
