// 从购物车删除商品接口

// 请求参数
export interface CartDeleteRequest {
  cart_ids: number[]; // 要删除的购物车项ID数组
}

// 响应数据
export interface CartDeleteResponseData {
  deleted_count: number; // 删除的数量
  remaining_count: number; // 剩余的数量
}

// 响应结构
export interface CartDeleteResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: CartDeleteResponseData;
}
// 从购物车删除商品接口
import getNeon from "~~/server/utils/neon";
import { requireAuth } from "~~/server/utils/auth";

const sql = getNeon(); // 更清晰的命名

export default defineEventHandler(
  async (event): Promise<CartDeleteResponse> => {
    console.log("🛒 删除购物车商品API被调用");

    // 1. 认证
    // 构建数据库插入数据
    const { code, message, data } = await requireAuth(event);
    const userId = data?.userId;
    if (!userId) {
      throw createError({ statusCode: 401, message: "用户未登录" });
    }

    // 2. 解析请求体
    const body: CartDeleteRequest = await readBody(event);
    const { cart_ids } = body;

    // 3. 参数校验
    if (!cart_ids || !Array.isArray(cart_ids) || cart_ids.length === 0) {
      throw createError({ statusCode: 400, message: "购物车ID数组不能为空" });
    }

    try {
      // 4. 执行删除（自动过滤不属于当前用户的项）
      const deleteResult = await sql`
      DELETE FROM cart_items
      WHERE id = ANY(${cart_ids})
      AND user_id = ${userId}
      RETURNING id
    `;

      // 5. 获取剩余数量
      const remainingResult = await sql`
      SELECT COUNT(*) as count FROM cart_items WHERE user_id = ${userId}
    `;
      const remainingCount = Number(remainingResult[0].count);

      console.log(
        `✅ 删除了 ${deleteResult.length} 项，剩余 ${remainingCount} 项`,
      );

      return {
        code: 200,
        msg: "删除购物车商品成功",
        data: {
          deleted_count: deleteResult.length,
          remaining_count: remainingCount,
        },
      };
    } catch (error) {
      console.error("❌ 删除购物车商品失败:", error);
      // 保留原始错误（如数据库连接错误等）
      if (error as Error & { statusCode: number }) {
        throw error;
      }
      throw createError({ statusCode: 500, message: "删除购物车商品失败" });
    }
  },
);
