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
          <i>正在和{{ curFd.username }}对话</i>,
          <i> 当前登录用户id为:{{ userState.user_id }} </i>

          <i>{{ loading ? "加载中..." : "" }}</i>
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
            <!-- 一行聊天记录：头像 + 消息气泡 + 右键出现菜单 -->
            <div
              class="absolute top-0 left-0 w-full list"
              :style="{
                top: `${startIndex * ITEM_H}px`,
              }"
            >
              <div
                v-for="(msg, index) in visibleList"
                :key="msg.seq"
                class="flex items-start mb-[10px] min-h-[50px] bg-pink"
                :class="
                  msg.sender_id == curFd.id ? 'flex-row' : 'flex-row-reverse'
                "
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
                    {{ msg.seq }}
                  </template>
                </ContextMenu>
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
import { ElMessage, ElMessage as $message } from "element-plus";

const userState = useUser();
const contextMenuRef = ref(null);

//  props 定义
const props = defineProps({
  curFd: {
    type: Object,
    default: () => ({}),
  },
  curRoomID: {
    type: Number,
    default: 0,
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

// 弹窗显示状态
const dialogVisible = ref(false);
const loading = ref(false);
const list = ref([]); // 聊天记录列表（响应式）
const scrollbarRef = ref(null); // 滚动容器引用

// 同步父组件 chatRecords 到子组件 list（避免直接修改props）
watch(
  () => props.chatRecords,
  (newVal) => {
    if (Array.isArray(newVal)) {
      loading.value = false;
      list.value = newVal; // 深拷贝，避免响应式污染
      // 初始加载后滚动到底部
    }
  },
  { immediate: true }
);

// 同步父组件 visible 到子组件 dialogVisible
watch(
  () => props.visible,
  (newVal) => {
    console.log("弹窗显示状态变更：", newVal);
    dialogVisible.value = newVal;
    if (newVal) {
      loading.value = true;
      socket.connect();
      nextTick(() => scrollToBottom());
    } else {
      // 关闭弹窗时停止加载
      loading.value = false;
    }
  },
  { immediate: true }
);

const chatRecordRef = ref(null);
/**
 * 监听聊天记录区域的右键点击事件
 * 关闭所有上下文菜单，阻止默认右键菜单
 */
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
  // 加入房间（使用 curFd.id 作为房间标识，更合理）
  if (props.curFd?.id) {
    socket.emit("join", props.curFd.id);
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
  if (!payload || !payload.seq) return;
  list.value.push(payload);
  console.log("list.value", list.value.length);
}

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

let isUnmounted = false;

/**
 * 关闭聊天弹窗，断开连接
 */
const handleCloseChatRoomDialog = () => {
  socket.disconnect();
  emit("update:visible", false);
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
  if (!props.curFd?.id) {
    $message.warning("请先选择好友");
    return;
  }
  if (list.value.length === 0) {
    $message.warning("暂无聊天记录，无法发送消息");
    return;
  }

  // 构建消息体
  const payload = {
    roomId: Number(props.curRoomID) || -1,
    sender_id: Number(userState.value.user_id) || -1,
    msg_type: 1,
    body: msg,
    update_at: formatTime(new Date(), {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    }),
    last_read_seq: list.value[list.value.length - 1].seq || -1,
  };
  console.log("payload", payload);
  // 发送消息
  socket.emit("chat", payload);
  ElMessage.success(`发送成功：${msg}`);

  // 清空输入框
  inputMessage.value = "";

  // 发送方自动滚动到底部
  scrollToBottom();
};

/************* 虚拟列表核心逻辑（优化后） *************/
const ITEM_H = 60; // 行高
const VIEWPORT_H = 500; // 可视区高度
const VISIBLE_COUNT = Math.ceil(VIEWPORT_H / ITEM_H); //可见数量: 可视区高度 / 行高 当可视窗口为 500 行高为 60 可见数量为 9
const scrollTop = ref(0); // 当前滚动位置
const totalHeight = computed(() => list.value.length * ITEM_H); // 总占位高度（关键！保证滚动条正常）
/* 只保留一个“起始索引”做响应式，scrollTop 本身不要响应式 */
const startIndex = ref(0);
const endIndex = computed(() =>
  Math.min(startIndex.value + VISIBLE_COUNT, list.value.length)
);
/* 计算属性：只依赖 startIndex，不会死循环 */
const visibleList = computed(() => {
  console.log("重新渲染");
  return list.value.slice(startIndex.value, endIndex.value);
});
/**
 * 处理滚动事件
 */
/* 滚动事件：只更新起始索引，不动 scrollTop */
const handleScroll = () => {
  if (!scrollbarRef.value) return;
  const st = scrollbarRef.value.scrollTop; // 读，不写
  startIndex.value = Math.floor(st / ITEM_H); // 只改这个
  console.log("startIndex.value", startIndex.value);
  closeAll();
};

/**
 * 滚动到底部（核心逻辑：scrollTop = 总内容高度 - 可视区高度）
 */
/* 滚动到底部：直接操作 DOM，不改响应式数据 */
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollbarRef.value) {
      scrollbarRef.value.scrollTop = totalHeight.value - VIEWPORT_H;
    }
  });
};

onUnmounted(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
  socket.off("before_disconnect", onBeforeDisconnect);
  socket.off("chat", onChat);
  socket.off("hello", onHello);
  socket.off("serverTime", onServerTime);
  console.log("【客户端】组件卸载，已移除所有 Socket 事件");
});
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
