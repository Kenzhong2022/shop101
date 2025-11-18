import { io } from "socket.io-client";
// 读取 Netlify 注入的变量，本地 fallback 到 localhost:8888
export const socket = io("wss://firstly-pipier-jensen.ngrok-free.dev", {
  autoConnect: false,
});
