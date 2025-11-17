import { io } from "socket.io-client";
// 从环境变量获取 Socket 服务器 URL，默认值为 localhost:3000
const socketUrl =
  import.meta.env.NUXT_PUBLIC_SOCKET_URL || "ws://localhost:3000";
// 创建 Socket.IO 客户端实例
export const socket = io(
  "wss://shop101-socket-server-production.up.railway.app",
  {
    autoConnect: false, // 先不连
    transports: ["websocket", "polling"], // 优先使用 WebSocket 传输
  }
);
