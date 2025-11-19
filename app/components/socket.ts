import { io } from "socket.io-client";

// 从 Nuxt 环境变量中读取配置（客户端可访问 NUXT_PUBLIC_ 前缀变量）
export const socket = io(import.meta.env.NUXT_PUBLIC_SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
