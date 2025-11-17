import { io } from "socket.io-client";
// export const socket = io(); // 自动连接服务器
export const socket = io({ autoConnect: false }); // 先不连
