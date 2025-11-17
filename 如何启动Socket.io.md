# Socket.IO 启动指南

本文档记录了项目中 Socket.IO 的配置和使用方法，包括客户端和服务端的完整设置。

## 📁 文件结构

### 服务端配置
- **路径**: `d:/shop101/server/plugins/socket.io.js`
- **作用**: Socket.IO 服务器端插件配置

### 客户端配置
- **路径**: `d:/shop101/app/components/socket.ts`
- **作用**: Socket.IO 客户端实例创建

### 客户端组件
- **路径**: `d:/shop101/app/components/Connection.client.vue`
- **作用**: WebSocket 连接测试组件

## 🔧 服务端配置详解

### 核心代码 (`socket.io.js`)

```javascript
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";

export default defineNitroPlugin((nitroApp) => {
  // 1. 初始化 Engine.io 服务器
  const engine = new Engine();
  
  // 2. 初始化 Socket.io 服务器并绑定 Engine.io
  const io = new Server();
  io.bind(engine);

  // 3. 监听连接事件
  io.on("connection", (socket) => {
    console.log("[ws] 有新客户端连接 🚀");
    
    // 监听客户端发送的 chat 事件
    socket.on("chat", (payload) => {
      console.log("[ws] 客户端发送消息:", payload);
      
      // 广播消息给所有客户端
      io.emit("chat", {
        from: "server",
        body: `你好，客户端！我收到了${payload.body}`,
      });
    });
  });

  // 4. 注册路由处理
  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          // @ts-expect-error private method and property
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error private method and property
          engine.onWebSocket(
            peer._internal.nodeReq,
            peer._internal.nodeReq.socket,
            peer.websocket
          );
        },
      },
    })
  );
});
```

### 服务端功能说明

1. **自动连接**: 服务器启动时自动初始化 Socket.IO
2. **事件监听**: 监听 `connection` 和 `disconnect` 事件
3. **消息处理**: 接收 `chat` 事件并广播响应
4. **路由配置**: 处理 `/socket.io/` 路径的 WebSocket 请求

## 🚀 客户端配置详解

### 客户端实例 (`socket.ts`)

```typescript
import { io } from "socket.io-client";
export const socket = io(); // 自动连接服务器
```

### 连接组件 (`Connection.client.vue`)

```vue
<script setup>
import { socket } from "./socket";

// 状态管理
const isConnected = ref(socket.connected);
const transport = ref(socket.connected ? socket.io.engine.transport.name : "N/A");

// 连接成功回调
function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;
  
  // 监听传输方式切换
  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
}

// 断开连接回调
function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

// 发送消息
function sendMsg() {
  if (!input.value.trim()) return;
  console.log("[ws] 客户端发送消息:", input.value);
  socket.emit("chat", { body: input.value });
  input.value = "";
}

// 监听服务端消息
function onChat(payload) {
  msgList.value.push(payload);
}

// 绑定事件
socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);
socket.on("chat", onChat);

// 组件卸载时解绑事件
onBeforeUnmount(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
  socket.off("chat", onChat);
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
</template>
```

## 🎯 使用方法

### 1. 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 测试 WebSocket 连接

1. 访问项目页面
2. 找到 `Connection.client.vue` 组件（通常在测试页面）
3. 观察连接状态显示
4. 在输入框中输入消息并按回车发送
5. 查看消息列表中的响应

### 3. 预期行为

- ✅ 连接状态显示为 "connected"
- ✅ 传输方式显示（如 "polling" 或 "websocket"）
- ✅ 发送消息后，服务端会广播响应
- ✅ 消息列表显示完整的对话记录

## 🔍 调试技巧

### 查看控制台日志

- **服务端**: 查看服务器控制台中的 `[ws]` 前缀日志
- **客户端**: 查看浏览器开发者工具控制台

### 常见问题排查

1. **连接失败**
   - 检查网络连接
   - 确认服务器端口正确
   - 查看防火墙设置

2. **消息不响应**
   - 检查事件名称是否匹配（`chat`）
   - 确认消息格式正确
   - 查看控制台错误信息

3. **传输方式问题**
   - WebSocket 需要服务器支持
   - 某些网络环境可能限制 WebSocket
   - 会自动降级到轮询（polling）

## 📋 事件说明

### 客户端事件

| 事件名称 | 方向 | 描述 |
|---------|------|------|
| `connect` | 客户端→服务端 | 建立连接 |
| `disconnect` | 客户端→服务端 | 断开连接 |
| `chat` | 客户端→服务端 | 发送聊天消息 |

### 服务端事件

| 事件名称 | 方向 | 描述 |
|---------|------|------|
| `chat` | 服务端→客户端 | 广播聊天消息 |

## 🔧 扩展建议

1. **添加更多事件类型**: 根据业务需求添加自定义事件
2. **实现房间功能**: 使用 Socket.IO 的房间功能进行分组通信
3. **添加认证**: 在连接时验证用户身份
4. **消息持久化**: 将聊天记录保存到数据库
5. **错误处理**: 添加完善的错误处理机制

## 📚 相关文档

- [Socket.IO 官方文档](https://socket.io/docs/)
- [Nuxt 3 插件文档](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Vue 3 生命周期](https://vuejs.org/guide/essentials/lifecycle.html)