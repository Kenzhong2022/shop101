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
          <i>总的高度{{ totalHeight }}</i>
          <i>切片起始坐标{{ startIndex }}</i>
          <i>切片结束坐标{{ endIndex }}</i>
        </header>
      </template>
      <!-- 聊天室内容区域：聊天记录 -->
      <template #default>
        <!-- 聊天室双方聊天内容 -->
        <div class="bg-[#191919] p-[10px]" ref="chatRecordRef">
          <div
            @scroll="handleScroll"
            ref="scrollbarRef"
            class="overflow-auto max-h-500px relative"
          >
            <div :style="{ height: totalHeight + 'px' }"></div>
            <!-- 可视区域内容 -->
            <div
              class="absolute top-0 left-0 w-full list"
              :style="{
                top: `${offsetTop}px`,
              }"
            >
              <!-- 一行聊天记录：头像 + 消息气泡 + 右键出现菜单 -->
              <div
                v-for="(msg, index) in visibleList"
                :key="msg.seq"
                :data-key="msg.seq"
                class="flex items-start mb-[10px] min-h-[50px]"
                :class="
                  msg.sender_id == curFd.id ? 'flex-row' : 'flex-row-reverse'
                "
                :ref="(el) => registerMsgRef(msg.seq, el)"
              >
                <!-- 头像（对方蓝色，我红色） -->
                <div
                  class="h-[50px] rounded-lg flex-shrink-0 overflow-hidden aspect-ratio-[1/1]"
                  :class="
                    msg.sender_id == curFd.id ? 'bg-blue-500' : 'bg-red-500'
                  "
                >
                  <el-image src="/icon头像1.webp" />
                </div>

                <!-- 消息气泡 -->
                <ContextMenu
                  class="mx-[10px] p-[12px] rounded-[8px] h-100% line-height-[1.4] font-bold max-w-[60%] break-words"
                  :class="
                    msg.sender_id == curFd.id
                      ? 'bg-[#2e2e2e] text-[#fff]'
                      : 'bg-[#3eb575] text-black'
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
                <div class="h-50px aspect-[1/1] flex items-start justify-end">
                  <kk-loading-com
                    v-if="msg?.status == 'pending'"
                    width="30px"
                    backgroundColor="#191919"
                  />
                  <div
                    v-else-if="msg?.status == 'fulfill'"
                    class="w-[20px] h-[20px] rounded-full bg-red-600 text-white text-center line-height-[20px]"
                  >
                    !
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- 聊天室底部: 输入框 + 发送按钮 -->
      <template #footer>
        <!-- 用户输入部分 -->
        <div class="flex flex-row gap-2">
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
import { ref, computed, watch, nextTick } from "vue";
import { formatTime } from "~/composables/tools";
import { useUser } from "~/composables/useUser";
import { closeAll } from "~/composables/useContextMenu";
const userState = useUser();
const contextMenuRef = ref(null);
const { $message } = useNuxtApp();
//  props 定义
const props = defineProps({
  curFd: {
    type: Object,
    required: true,
  },
  curRoomID: {
    type: Number,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  chatRecords: {
    type: Array,
    default: () => [],
  },
});

// 弹窗显示状态
const dialogVisible = ref(false);
const loading = ref(false);
const list = ref([]); // 聊天记录列表（响应式）
const scrollbarRef = ref(null); // 滚动容器引用

watch(
  () => props.chatRecords,
  (newList) => {
    if (Array.isArray(newList)) {
      loading.value = false;
      list.value = newList; // 深拷贝，避免响应式污染
    }
  },
  { immediate: true }
);
const offsetTop = ref(0);
// 定义消息引用数组
const msgHeightMap = new Map();
/**
 * 注册消息引用
 * @param {string} seq - 消息序列
 * @param {Element} el - 消息元素引用
 */
function registerMsgRef(seq, el) {
  if (!seq || !el) return;
  nextTick(() => {
    // console.log("registerMsgRef", seq, el.clientHeight);
    const MT = 10; // 消息气泡的外边框
    msgHeightMap.set(seq, el?.clientHeight + MT);
    console.log([...msgHeightMap.entries()]);
  });
}
const chatRecordRef = ref(null);
watch(
  chatRecordRef,
  (newVal) => {
    if (newVal) {
      newVal.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        closeAll();
      });
    }
  },
  { once: true }
); // 只绑定一次，避免重复绑定

/**
 * 处理上下文菜单点击事件
 */
const handleSelect = (item, tarRef, index) => {
  console.log("点击了菜单：", item, tarRef);
  if (item.label === "复制") {
    handleCopy(tarRef);
  }
};

// 复制消息
const handleCopy = (tarRef) => {
  const text = tarRef?.$el?.textContent?.trim();
  if (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success("复制成功");
      })
      .catch(() => {
        ElMessage.error("复制失败");
      });
  }
};

// Socket 相关逻辑
import { socket } from "./socket"; // 引入 socket 实例
const isConnected = ref(socket.connected);
const transport = ref(
  socket.connected ? socket.io.engine.transport.name : "N/A"
);

// 连接成功回调
function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;
  console.log("Socket 连接成功，传输方式：", transport.value);
  // 监听传输方式切换
  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
  // 加入房间
  if (props.curRoomID) {
    socket.emit("join", Number(props.curRoomID));
  }
}

// 断开连接回调
function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
  console.log("Socket 连接已断开");
}

/**
 * 处理服务端广播的聊天消息
 * 关键优化：避免新增消息触发无限滚动和切片循环
 */
function onChat(payload) {
  console.log("【客户端】收到服务端广播：", payload);
  if (payload.seq !== list.value[list.value.length - 1].seq) {
    list.value.push(payload);
  } else {
    // console.log("重复消息，忽略");
    list.value[list.value.length - 1] = payload;
  }
  nextTick(() => {
    scrollToBottom();
  });
}
const myRooms = new Set();
const onJoined = (room) => {
  myRooms.add(room);
  console.log("我当前在", [...myRooms]);
};
socket.on("joined", onJoined);
// 监听服务器问候事件
function onHello(greeting) {
  console.log("【客户端】收到服务器问候:", greeting);
}

// 监听服务端时间事件
function onServerTime({ msg, time }) {
  console.log(`[${time}] ${msg}`);
}
const onBeforeDisconnect = (reason) => {
  console.log("【客户端】收到服务器断开通知:", reason);
  ElMessage.warning(`服务器断开连接：${reason}`);
};
// 绑定 Socket 事件（组件挂载时绑定，卸载时解绑）
socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);
socket.on("before_disconnect", onBeforeDisconnect);
socket.on("chat", onChat);
socket.on("hello", onHello);
socket.on("serverTime", onServerTime);

/**
 * 关闭聊天弹窗，断开连接
 */
const handleCloseChatRoomDialog = () => {
  socket.disconnect();
  inputMessage.value = ""; // 清空输入框
};

// 输入框相关
const inputMessage = ref("");
/**
 * 发送消息
 */
const handleSendMessage = () => {
  const msg = inputMessage.value.trim();
  // 校验
  if (!msg) {
    $message.warning("请输入消息");
    return;
  }

  // 构建消息体
  const payload = {
    roomId: Number(props.curRoomID),
    sender_id: Number(userState.value.user_id),
    msg_type: 1,
    body: msg,
    update_at: formatTime(new Date(), {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    }),
    last_read_seq: list.value[list.value.length - 1].seq,
  };
  console.log("payload", payload);
  // 发送消息
  socket.emit("chat", payload);
  $message.success(`发送成功：${msg}`);
  // 清空输入框
  inputMessage.value = "";
};

/************* 虚拟列表核心逻辑（优化后） *************/
const ITEM_H = 60; // 行高
const VIEWPORT_H = 500; // 可视区高度
const VISIBLE_COUNT = Math.ceil(VIEWPORT_H / ITEM_H); //可见数量: 可视区高度 / 行高 当可视窗口为 500 行高为 60 可见数量为 9
const totalHeight = computed(() => {
  // 从 0 - 数组长度list 每个元素的高度累加
  return list.value.length * ITEM_H;
});

/* 只保留一个“起始索引”做响应式，scrollTop 本身不要响应式 */
const startIndex = ref(0);
// 调试监听startIndex
watch(
  () => startIndex.value,
  (newIndex) => {
    console.log("startIndex 变化了", newIndex);
    // 执行副作用，更新 offsetTop
    if (msgHeightMap.size > 0) {
      offsetTop.value = [...msgHeightMap.entries()]
        .slice(0, newIndex)
        .reduce((acc, cur) => acc + cur[1], 0);
      offsetTop.value = Math.min(st.value, offsetTop.value);
    }
  }
);
const endIndex = computed(() =>
  Math.min(startIndex.value + VISIBLE_COUNT, list.value.length)
);

/* 计算属性：只依赖 startIndex，不会死循环 */
const visibleList = computed(() => {
  console.log("重新渲染", startIndex.value, endIndex.value);
  return list.value.slice(startIndex.value, endIndex.value);
});
const st = ref(0);

/**
 * 处理滚动事件
 */
/* 滚动事件：只更新起始索引，不动 scrollTop */
const handleScroll = () => {
  if (!scrollbarRef.value) return;
  st.value = scrollbarRef.value.scrollTop;
  startIndex.value = Math.floor(st.value / ITEM_H);
  closeAll(); // 滚动时清除右键菜单
};

/**
 * 滚动到底部（核心逻辑：scrollTop = 总内容高度 - 可视区高度）
 */
/* 滚动到底部：直接操作 DOM，不改响应式数据 */
const scrollToBottom = () => {
  if (scrollbarRef.value) {
    nextTick(() => {
      scrollbarRef.value.scrollTo({
        top: 9999999,
        behavior: "smooth", // 重点！这个参数让滚动变丝滑
      });
    });
  }
};

onUnmounted(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
  socket.off("before_disconnect", onBeforeDisconnect);
  socket.off("chat", onChat);
  socket.off("hello", onHello);
  socket.off("serverTime", onServerTime);
  socket.off("joined", onJoined);
  console.log("【客户端】组件卸载，已移除所有 Socket 事件");
  socket.disconnect();
});
/**
 * 打开聊天弹窗
 */
function open() {
  dialogVisible.value = true;
  socket.connect();
  nextTick(() => {
    scrollToBottom();
  });
}
/**
 * 关闭聊天弹窗
 */
function close() {
  dialogVisible.value = false;
}
defineExpose({ open, close });
</script>

<style scoped>
/* 确保消息项高度稳定（避免渲染偏差） */
.min-h-\[50px\] {
  min-height: 50px !important;
  box-sizing: border-box;
}
/* 修复头像显示 */
.el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
