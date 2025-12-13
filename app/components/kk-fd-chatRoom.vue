<template>
  <!-- 聊天室弹窗 -->
  <div>
    <el-dialog
      :modal="false"
      :modal-penetrable="true"
      v-model="dialogVisible"
      title="Tips"
      :width="isMobile ? '100%' : '800px'"
      draggable
      @close="handleCloseChatRoomDialog"
    >
      <!-- 聊天室顶部：和谁聊天 -->
      <template #header>
        <header class="text-center text-2xl font-bold">
          正在和{{ curFd.username }}对话,当前登录用户id为:{{ userState.user_id
          }}{{ loading ? "加载中..." : "" }}
        </header>
      </template>
      <!-- 聊天室内容区域：聊天记录 -->
      <template #default>
        <!-- 聊天室双方聊天内容 -->
        <div class="bg-#191919 p-10px" ref="chatRecordRef">
          <el-scrollbar
            height="500px"
            ref="scrollbarRef"
            @scroll="handleScroll"
          >
            <!-- 一行聊天记录：头像 + 消息气泡 + 右键出现菜单 -->
            <div
              v-for="(msg, index) in list"
              :key="msg.seq"
              class="flex items-start mb-10px min-h-50px"
              :class="
                msg.sender_id == curFd.id ? 'flex-row' : 'flex-row-reverse'
              "
            >
              <!-- 头像（对方蓝色，我红色） -->
              <div
                class="h-50px rounded-lg flex-shrink-0 overflow-hidden aspect-ratio-[1/1]"
                :class="
                  msg.sender_id == curFd.id ? 'bg-blue-500' : 'bg-red-500'
                "
              >
                <!-- 后期替真实头像 -->
                <!-- <img v-if="false" :src="avatarUrl(msg.sender_id)" /> -->
                <el-image v-if="true" src="/icon头像1.webp" />
              </div>

              <!-- 消息气泡 -->
              <ContextMenu
                class="mx-10px p-12px rounded-8px h-100% line-height-[1.4] font-bold max-w-60% break-words"
                :class="
                  msg.sender_id == curFd.id
                    ? 'bg-#2e2e2e text-#fff'
                    : 'bg-#3eb575 text-black'
                "
                :menuItems="[
                  { label: '复制' },
                  { label: '删除' },
                  { label: '撤回' },
                ]"
                :index="index"
                ref="contextMenuRef"
                @select="(item, target) => handleSelect(item, target, index)"
              >
                <template #body>
                  {{ msg.body }}
                </template>
              </ContextMenu>
            </div>
          </el-scrollbar>
        </div>
      </template>
      <!-- 聊天室底部: 输入框 + 发送按钮 -->
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
/************* 虚拟列表 start *************/
const ITEM_H = 100; // css 里写的 min-h-100px
const VIEWPORT_H = 500; // el-scrollbar 高度
const BUFFER = 3; // 上下缓冲行数

const scrollTop = ref(0); // 当前滚动位置
const totalHeight = ref(0); // 总占位高度
const visibleRange = ref({ start: 0, end: 0, offsetY: 0 }); // 可见范围{开始索引，结束索引，偏移量}
/************* 虚拟列表 end *************/

/* 可视区域切片 */
const visibleList = computed(() => {
  const total = list.value.length;
  if (!total) return [];

  // 计算起始索引
  let start = Math.floor(scrollTop.value / ITEM_H) - BUFFER;
  start = Math.max(0, start);

  // 结束索引
  let end = start + Math.ceil(VIEWPORT_H / ITEM_H) + BUFFER * 2;
  end = Math.min(total - 1, end);

  // 切片
  const slice = [];
  for (let i = start; i <= end; i++) {
    slice.push({ ...list.value[i], $index: i }); // 把真实索引带上
  }
  return slice;
});

import { formatTime } from "~/composables/tools";
import { useUser, getCurrentUser } from "~/composables/useUser";
import { closeAll } from "~/composables/useContextMenu";
const userState = useUser();
const contextMenuRef = ref(null);

const props = defineProps({
  curFd: {
    type: Object,
    default: () => ({}),
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  chatRecords: {
    type: Array,
    default: () => [],
  },
});

// 触发对应的更新事件（update:+props名）
const emit = defineEmits(["update:visible"]);

const dialogVisible = ref();
const loading = ref(false);
const list = ref([]);
// 同步父组件 chatRecords 到子组件 list
watch(
  () => props.chatRecords,
  (newVal) => {
    loading.value = false;
    list.value = newVal;
  }
);
// 同步父组件 visible 到子组件 dialogVisible
watch(
  () => props.visible,
  (newVal) => {
    console.log("visible", newVal);
    dialogVisible.value = newVal;
    loading.value = true;
    socket.connect();
  },
  { immediate: true }
);

/**
 * 处理滚动事件，关闭所有上下文菜单
 * @param scrollTop 滚动事件参数，包含滚动Top值
 */
const handleScroll = ({ scrollTop }) => {
  closeAll(); // 关闭所有上下文菜单
};

const chatRecordRef = ref(null);

/**
 * 监听聊天记录区域的右键点击事件
 * @description 当用户在聊天记录区域右键点击时，关闭所有上下文菜单
 */
watch(chatRecordRef, (newVal) => {
  if (newVal) {
    newVal.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      closeAll();
    });
  }
});

/**
 * @description 处理上下文菜单点击事件
 * @param item 点击的上下文菜单项
 * @param tarRef 点击的目标元素引用
 * @description 右键点击聊天记录项时，根据点击类型执行相应操作（复制消息、删除消息等）
 */
const handleSelect = (item, tarRef, index) => {
  console.log("点击了", item, tarRef);
  if (item.label === "复制") {
    handleCopy(tarRef);
  }
};

import { socket } from "./socket"; // 引入 socket 实例
// 状态管理
const isConnected = ref(socket.connected);
// 传输方式
const transport = ref(
  socket.connected ? socket.io.engine.transport.name : "N/A"
);

// 定义用户输入消息
const inputMessage = ref("");
// 定义方法：handleSendMessage
const handleSendMessage = () => {
  console.log("发送消息", inputMessage.value);
  const msg = inputMessage.value;
  // 校验用户输入
  if (!msg.trim()) {
    const { $message } = useNuxtApp();
    $message.warning("请输入消息");
    return;
  }
  if (!list?.value[0]) {
    const { $message } = useNuxtApp();
    $message.warning("请先选择好友");
    return;
  }
  console.log("last_read_seq", list?.value[0].seq);
  // 构建参数
  const payload = {
    roomId: Number(list?.value[0]?.room_id) || -1,
    sender_id: Number(userState.value.user_id) || -1,
    msg_type: 1,
    body: msg,
    // 格式化时间戳
    update_at: formatTime(new Date(), {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    }),
    last_read_seq: list.value[list.value.length - 1].seq || -1,
  };
  ElMessage({
    message: `发送成功:${payload.body}用户id是：${payload.sender_id}`,
    type: "success",
  });
  console.log("发送消息到服务器，服务器根据数据插入数据库", payload);
  // emit 事件（发送消息到服务端）
  socket.emit("chat", payload);
  // 清空输入框
  inputMessage.value = "";
};

/**
 * 连接成功回调
 * @description 连接成功后，设置连接状态为 true，记录传输方式，打印连接成功日志，监听传输方式切换（如polling升级为websocket），加入房间
 */
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
  // 断开连接
  socket.disconnect();
  // 触发更新事件，关闭弹窗
  emit("update:visible", false);
};

// 断开连接回调
function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
  console.log("连接已断开");
}

/**
 * @param payload 服务端广播消息
 * @description 监听服务端广播，将消息添加到聊天记录列表
 */
function onChat(payload) {
  console.log("【客户端】收到服务端广播【已经插入到数据库】，", payload);
  // push 到聊天记录列表
  list.value = [...list.value, payload];
}

/**
 * @param payload 服务端时间消息
 * @description 监听服务端时间事件，打印服务端时间
 */
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
socket.on("before_disconnect", (reason) => {
  console.log("【客户端】收到服务器断开通知:", reason);
  alert("服务器断开连接，原因：" + reason);
});
socket.on("chat", onChat);
socket.on("hello", onHello); // 监听服务器问候事件
socket.on("serverTime", onServerTime); // 监听服务端时间事件

/* 组件卸载时统一解绑, 避免内存泄漏 */
onBeforeUnmount(() => {
  console.log("[ws] 组件卸载时解绑事件");
  // 解绑事件
  socket.off("connect", onConnect);
  // 解绑断开事件
  socket.off("disconnect", onDisconnect);
  // 解绑服务器断开通知事件
  socket.off("before_disconnect", (reason) => {
    console.log("【客户端】收到服务器断开通知:", reason);
    alert("服务器断开连接，原因：" + reason);
  });
  // 解绑自定义事件
  socket.off("chat", onChat);
  // 解绑服务端时间事件
  socket.off("serverTime", onServerTime);
  // 解绑问候事件
  socket.off("hello", onHello);
});
</script>
