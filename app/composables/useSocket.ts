// composables/useSocket.ts
import { io, type Socket } from "socket.io-client";
import { ref } from "vue";

/** 单例：整个客户端生命周期只连一次 */
let _socket: Socket | null = null;

export function useSocket(): Socket {
  if (process.server) {
    // 服务端渲染期间直接抛错，确保只在浏览器调用
    throw new Error("useSocket() 只能在客户端使用");
  }
  if (!_socket) {
    _socket = io(); // 同域即可
  }
  return _socket;
}
