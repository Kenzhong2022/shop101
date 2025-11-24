<script setup>
import { socket } from "./socket";

// 状态管理
const isConnected = ref(socket.connected);
const input = ref("");
const msgList = ref([]);

// 连接状态监听
function onConnect(message) {
  isConnected.value = true;
  console.log("连接成功:", message);
}

function onDisconnect(message) {
  isConnected.value = false;
  console.log("服务器断开连接:", message);
  msgList.value.push({ from: "服务器", body: message });
}

// 消息处理
function onChat(payload) {
  msgList.value.push(payload);
}

function onHello(message) {
  msgList.value.push({ from: "服务器", body: message });
}

// 发送消息
function sendMsg() {
  if (!input.value.trim()) return;
  socket.emit("chat", { body: input.value });
  input.value = "";
}

// 事件绑定
socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);
socket.on("chat", onChat);
socket.on("hello", onHello);

// 清理事件
onBeforeUnmount(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
  socket.off("chat", onChat);
  socket.off("hello", onHello);
});
</script>

<template>
  <div class="connection-status">
    <div class="status-bar">
      <span
        :class="['status-dot', isConnected ? 'connected' : 'disconnected']"
      ></span>
      <span>{{ isConnected ? "已连接" : "未连接" }}</span>
    </div>

    <div class="message-area">
      <div class="input-group">
        <input
          v-model="input"
          @keyup.enter="sendMsg"
          placeholder="输入消息..."
          class="message-input"
        />
        <button @click="sendMsg" class="send-btn">发送</button>
      </div>

      <div class="control-buttons">
        <button @click="socket.connect()" class="connect-btn">连接</button>
        <button @click="socket.disconnect()" class="disconnect-btn">
          断开
        </button>
      </div>
    </div>

    <div class="messages">
      <div v-for="(msg, idx) in msgList" :key="idx" class="message-item">
        <span class="msg-from">{{ msg.from }}:</span>
        <span class="msg-body">{{ msg.body }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connection-status {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: bold;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4444;
}

.status-dot.connected {
  background: #44ff44;
}

.message-area {
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.message-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.send-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover {
  background: #0056b3;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.connect-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.connect-btn:hover {
  background: #1e7e34;
}

.disconnect-btn {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.disconnect-btn:hover {
  background: #c82333;
}

.messages {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.message-item {
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.message-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.msg-from {
  font-weight: bold;
  color: #007bff;
  margin-right: 8px;
}

.msg-body {
  color: #333;
}
</style>
