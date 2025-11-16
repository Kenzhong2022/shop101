/**
 * 获取好友聊天记录
 * @param friendId 好友ID
 * @param count 拉取聊天记录数量
 * @param startTime 开始时间（可选）
 * @param endTime 结束时间（可选）
 * @returns 好友聊天记录列表
 */

// 获取好友聊天记录接口
// 对应前端: POST /friends/chat
import getNeon from "~~/server/utils/neon";
import { checkToken } from "~~/server/utils/auth";
const mySql = getNeon();
export interface ChatRecords {
  senderId: string; // 发送者ID
  receiverId: string; // 接收者ID
  content: string; // 聊天内容
  createdAt: string; // 创建时间
  seq: number; // 聊天记录序号 越大越新
}

export interface ChatRecordsResponse {
  success: boolean;
  message: string;
  list: ChatRecords[]; // 好友聊天记录列表
}

export interface ChatRecordsRequest {
  friendId: string; // 好友ID
  count: number; // 拉取聊天记录数量
  startTime?: string; // 开始时间（可选）
  endTime?: string; // 结束时间（可选）
}

export default defineEventHandler(
  async (event): Promise<ChatRecordsResponse> => {
    console.log("💬 获取好友聊天记录接口被调用");

    try {
      // 获取并验证用户Token
      const authHeader = getHeader(event, "authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createError({
          statusCode: 401,
          statusMessage: "未提供有效的认证Token",
        });
      }

      const token = authHeader.substring(7); // 移除 "Bearer " 前缀
      const userId = checkToken(token); // 验证Token并获取用户ID
      console.log("👤 当前用户ID:", userId);

      // 获取请求体参数
      const body: ChatRecordsRequest = await readBody(event);
      console.log("📋 接收到的请求体参数:", body);

      // 解析请求参数
      const { friendId, count = 20, startTime, endTime } = body;

      // 参数验证
      if (!friendId) {
        throw createError({
          statusCode: 400,
          statusMessage: "好友ID不能为空",
        });
      }

      if (!count || count <= 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "拉取数量必须大于0",
        });
      }

      console.log("📝 查询参数:", {
        userId,
        friendId,
        count,
        startTime,
        endTime,
      });

      // 查询用户与好友之间的聊天房间ID chat_participant: 聊天室参与者
      const rows = await mySql`
        SELECT cp.room_id
        FROM chat_participant cp
        WHERE cp.user_id IN (${userId}, ${friendId})        
        GROUP BY cp.room_id
        HAVING COUNT(DISTINCT cp.user_id) = 2
      `;

      // 检查是否有聊天房间
      if (rows.length !== 0) {
        const roomId = rows[0].room_id;
        console.log("查到的房间号：", roomId);

        // 查询聊天记录
        const chatRows = await mySql`
          SELECT 
            sender_id,
            body,
            created_at,
            seq
          FROM message
          WHERE message.room_id = ${roomId}
        `;
        console.log("查到的聊天记录：", chatRows);
        return {
          success: true,
          message: "获取聊天记录成功",
          list: chatRows as ChatRecords[],
        } as ChatRecordsResponse;
      }

      return {
        success: true,
        message: "用户与好友之间不存在聊天房间",
        list: [],
      } as ChatRecordsResponse;
    } catch (error) {
      console.error("❌ 获取聊天记录失败:", error);

      // 其他错误
      throw createError({
        statusCode: 500,
        statusMessage: "获取聊天记录失败",
      });
    }
  }
);
