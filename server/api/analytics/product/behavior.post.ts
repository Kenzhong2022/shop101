// 数据库连接
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();
// 导入类型定义
import type { CreateBehaviorRequest } from "~~/app/types/analytics";

/**
 * 处理商品浏览行为数据存储
 * 接收来自 useDurationTrack 组合式函数的上报数据
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = (await readBody(event)) as CreateBehaviorRequest;
    console.log("useProductBehavior:", body);
    // 数据验证
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "请求体不能为空",
      });
    }

    const { goodsId, duration, behaviorType, deviceType, sourcePage, extra } =
      body;

    // 必要字段验证
    if (!goodsId) {
      throw createError({
        statusCode: 400,
        statusMessage: "商品ID不能为空",
      });
    }

    // 构建数据库插入数据
    const token = getCookie(event, "auth-token");
    const userId = token ? parseInt(token.split(".")[0]) : null; // 按照 . 分割获取用户ID
    const sessionId = event.context.sessionId || generateSessionId(); // 生成会话ID

    const insertData = {
      user_id: userId,
      session_id: sessionId,
      goods_id: goodsId,
      behavior_type: behaviorType,
      duration_ms: duration || null,
      quantity: null, // view 行为没有数量
      price: null, // view 行为没有价格
      extra: extra ? JSON.stringify(extra) : "{}",
      source_page: sourcePage || null,
      device_type: deviceType || "pc",
      created_at: new Date().toISOString(),
    };

    // 执行数据库插入
    const result = await mySql`
      INSERT INTO user_product_behavior (
        user_id,
        session_id,
        goods_id,
        behavior_type,
        duration_ms,
        quantity,
        price,
        extra,
        source_page,
        device_type,
        created_at
      ) VALUES (
        ${insertData.user_id},
        ${insertData.session_id},
        ${insertData.goods_id},
        ${insertData.behavior_type},
        ${insertData.duration_ms},
        ${insertData.quantity},
        ${insertData.price},
        ${insertData.extra},
        ${insertData.source_page},
        ${insertData.device_type},
        ${insertData.created_at}
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
  } catch (error) {
    // 错误处理
    console.error("商品浏览行为记录失败:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "内部服务器错误",
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
