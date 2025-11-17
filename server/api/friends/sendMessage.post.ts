/**
 * 发送好友消息
 * @param data 发送好友消息请求体
 * @returns 发送好友消息响应体
 * @description 发送好友消息接口，用于发送好友消息 Post 请求
 */

/**
 * 插入一条好友消息记录
 * @param data 好友消息记录
 */
export interface SendMessageRequest {
  friendId: string; // 好友ID
  content: string; // 聊天内容
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}
export default defineEventHandler(
  async (event): Promise<SendMessageResponse> => {
    console.log("🔍 发送好友消息接口被调用 ");
    // 获取请求体参数（POST请求使用readBody）
    const body: SendMessageRequest = await readBody(event);
    console.log("📋 接收到的请求体参数:", body);
    return {
      success: true,
      message: "好友消息发送成功",
    } as SendMessageResponse;
  }
);
