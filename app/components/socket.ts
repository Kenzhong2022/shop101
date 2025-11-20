import { io } from "socket.io-client";
// 从 Nuxt 环境变量中读取配置（客户端可访问 NUXT_PUBLIC_ 前缀变量）
export const socket = io("wss://shop101-socket-server.zeabur.app", {
  autoConnect: false, // 手动连接
  transports: ["websocket", "polling"],
});
