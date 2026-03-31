import type { ApiResponse } from "~~/server/types/user-address";
import { requireAuth } from "~~/server/utils/auth";
import getNeon from "~~/server/utils/neon";
const sql = getNeon();

/**
 * 删除地址
 * @returns 删除地址响应
 */
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  console.log("🔍 删除地址API接口被调用");
  const { userId } = await requireAuth(event);

  // 1. 获取地址ID
  const addressId = getRouterParam(event, "id");
  if (!addressId || isNaN(Number(addressId))) {
    throw createError({
      statusCode: 400,
      message: "地址ID无效",
    });
  }

  // 2. 验证地址是否属于当前用户
  const [existingAddress] = await sql`
    SELECT id FROM user_address 
    WHERE id = ${Number(addressId)} AND user_id = ${userId}
  `;

  if (!existingAddress) {
    throw createError({
      statusCode: 404,
      message: "地址不存在或无权限删除",
    });
  }

  // 3. 执行删除
  try {
    await sql`
      DELETE FROM user_address
      WHERE id = ${Number(addressId)} AND user_id = ${userId}
    `;

    console.log("✅ 地址删除成功:", addressId);

    return {
      code: 200,
      msg: "删除地址成功",
      data: null,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ 数据库删除失败:", error);

    throw createError({
      statusCode: 500,
      message: "服务器内部错误，删除地址失败",
    });
  }
});
