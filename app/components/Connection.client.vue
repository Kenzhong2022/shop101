<script setup>
import { socket } from "./socket"; // 引入 socket 实例
// 状态管理
const isConnected = ref(socket.connected);
// 传输方式
const transport = ref(
  socket.connected ? socket.io.engine.transport.name : "N/A"
);

// 连接成功回调
function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;
  // 监听传输方式切换（如polling升级为websocket）
  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
}

// 断开连接回调
function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

// 输入框
const input = ref("");
// 消息列表
const msgList = ref([]);

/* 发送 */
function sendMsg() {
  if (!input.value.trim()) return;
  console.log("[ws] 客户端发送消息:", input.value);
  // emit 事件（发送消息到服务端）
  socket.emit("chat", { body: input.value });
  input.value = "";
}

/* 监听服务端广播 */
function onChat(payload) {
  msgList.value.push(payload);
}

function onServerTime({ msg, time }) {
  console.log(`[${time}] ${msg}`);
}

/* 监听服务器问候事件 */
function onHello(message) {
  console.log("[ws] 收到服务器问候:", message);
  msgList.value.push({ from: "服务器", body: message });
}

// 绑定事件 （连接成功、断开、自定义事件）
socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);
socket.on("chat", onChat); // ② 注册监听
socket.on("serverTime", onServerTime);
socket.on("hello", onHello); // 监听服务器问候事件

/* 组件卸载时统一解绑, 避免内存泄漏 */
onBeforeUnmount(() => {
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

<template>
  <div>
    <p>Status: {{ isConnected ? "connected" : "disconnected" }}</p>
    <p>Transport: {{ transport }}</p>

    <!-- 发送区 -->
    <input v-model="input" @keyup.enter="sendMsg" placeholder="按回车发送" />
    <button @click="sendMsg">发送</button>
    <button @click="socket.disconnect()">断开连接</button>
    <button @click="socket.connect()">重新连接</button>

    <!-- 消息区 -->
    <ul>
      <li v-for="(m, idx) in msgList" :key="idx">{{ m.from }}: {{ m.body }}</li>
    </ul>
  </div>
</template>
