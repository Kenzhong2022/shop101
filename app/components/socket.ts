import { io } from "socket.io-client";
// 读取 Netlify 注入的变量，本地 fallback 到 localhost:8888
const config = useRuntimeConfig(); // ← 只在前端或插件里用

export const socket = io(config.public.SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
