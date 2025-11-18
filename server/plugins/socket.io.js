import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";

import getNeon from "~~/server/utils/neon";

export default defineNitroPlugin((nitroApp) => {
  const mySql = getNeon();

  const engine = new Engine();
  const io = new Server();
  io.bind(engine);

  io.on("connection", (socket) => {
    console.log("[ws] 有新客户端连接 🚀");
    // 向客户端发送连接成功的问候
    socket.emit("hello", "来自服务器【本地的nuxt-socket】的问候");
    socket.on("join", (roomId) => {
      socket.join(`room${roomId}`);
      console.log(`[ws] ${socket.id} 加入房间 room${roomId}`);
    });
    socket.on("chat", async (payload) => {
      const { body, sender_id, roomId, last_read_seq } = payload;
      console.log("[ws] 收到消息:", payload);
      try {
        /**
         * Neon（Postgres）不允许在 聚合函数（MAX()）上直接加 FOR UPDATE；FOR UPDATE 只能锁具体行或间隙，而 MAX() 返回的是聚合结果，不是物理行。
         */
        /* 1. 锁最新一行拿 seq */
        const [lastRow] = await mySql`
          SELECT seq
          FROM   message
          WHERE  room_id = ${roomId}
          ORDER  BY seq DESC
          LIMIT  1
          FOR UPDATE
        `;
        const nextSeq = (lastRow?.seq ?? 0) * 1 + 1;

        /* 2. 插入并拿回完整数据 */
        const [insertRes] = await mySql`
          INSERT INTO message (room_id, seq, sender_id, body)
          VALUES (${roomId}, ${nextSeq}, ${sender_id}, ${body})
          RETURNING id, created_at
        `;

        /* 3. 组装 & 广播 */
        const newMsg = {
          id: insertRes.id,
          room_id: roomId,
          seq: nextSeq,
          sender_id,
          body,
          created_at: insertRes.created_at,
        };
        io.to(`room${roomId}`).emit("chat", newMsg);
      } catch (e) {
        await mySql`ROLLBACK`; // 回滚事务
        console.error("[ws] chat 事务失败:", e);
        socket.emit("error", { msg: "发送失败" });
      }
    });

    socket.on("disconnect", () => {
      console.log("[ws] 客户端断开连接");
    });
  });

  /* 路由绑定（不变） */
  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          // @ts-expect-error
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error
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
