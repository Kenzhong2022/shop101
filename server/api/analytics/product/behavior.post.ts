// 数据库连接
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();
// 导入类型定义
import type { CreateActionRequest } from "~~/app/types/analytics";
//====================导入登录认证工具=========================
import { requireAuth } from "~~/server/utils/auth";
/**
 * 处理商品浏览行为数据存储
 * 接收来自 useDurationTrack 组合式函数的上报数据
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = (await readBody(event)) as CreateActionRequest;
    console.log("【商品浏览行为记录请求体】:", body);
    // 数据验证
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        message: "请求体不能为空",
      });
    }

    const { item_id, action_type, action_weight, action_time, session_id } =
      body;
    const sessionId = session_id || generateSessionId(); // 生成会话ID

    const insertData = {
      user_id: null as number | null,
      session_id: sessionId,
      item_id: item_id,
      action_type: action_type,
      action_weight: action_weight || null,
      action_time: action_time || new Date().toISOString(),
    };
    // 必要字段验证
    if (!item_id) {
      throw createError({
        statusCode: 400,
        message: "商品ID不能为空",
      });
    }
    let userId: number;
    // 构建数据库插入数据
    if (action_type !== 1) {
      const { code, message, data } = await requireAuth(event);
      if (code === 401) {
        throw createError({
          statusCode: 401,
          message: "用户未登录,不能记录商品浏览行为数据",
          data: {},
        });
      }
      if (data) {
        // 新增insertData对象属性user_id
        insertData.user_id = data.userId;
      }
    }

    // 执行数据库插入
    const result = await mySql`
      INSERT INTO user_item_action (
        user_id,
        item_id,
        action_type,
        action_weight,
        action_time,
        session_id
      ) VALUES (
        ${insertData.user_id},
        ${insertData.item_id},
        ${insertData.action_type},
        ${insertData.action_weight},
        ${insertData.action_time},
        ${insertData.session_id}
      )
    RETURNING id
    `;
    // 返回成功响应
    return {
      code: 200,
      message: "行为数据记录成功",
      data: {
        id: result[0].id,
        ...insertData,
      },
    };
  } catch (error: any) {
    console.error("商品浏览行为记录失败:", error);

    if (error?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "内部服务器错误",
    });
  }
});

/**
 * 生成会话ID（用于未登录用户）
 */
function generateSessionId(): string {
  return (
    "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}
