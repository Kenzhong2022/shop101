import type {
  UpdateAddressRequest,
  ApiResponse,
} from "~~/server/types/user-address";
import { requireAuth } from "~~/server/utils/auth";
//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const sql = getNeon();

/**
 * 更新地址
 * @returns 更新地址响应
 */
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  console.log("🔍 更新地址API接口被调用");
  const { userId } = event.context.user;

  // 1. 获取地址ID
  const addressId = getRouterParam(event, "id");
  if (!addressId || isNaN(Number(addressId))) {
    throw createError({
      statusCode: 400,
      message: "地址ID无效",
    });
  }

  // 2. 获取请求参数
  const body: UpdateAddressRequest = await readBody(event);
  console.log("📋 接收到的请求参数:", body);

  // 3. 参数验证 - 至少需要传递一个更新字段
  const updatableFields = [
    "recipient_name",
    "recipient_phone",
    "province_code",
    "city_code",
    "district_code",
    "detail_address",
    "is_default",
  ] as const;

  const hasUpdateField = updatableFields.some(
    (field) => body[field] !== undefined,
  );

  if (!hasUpdateField) {
    throw createError({
      statusCode: 400,
      message: "至少需要传递一个更新字段",
    });
  }

  // 4. 验证地址是否属于当前用户
  const [existingAddress] = await sql`
    SELECT id FROM user_address 
    WHERE id = ${Number(addressId)} AND user_id = ${userId}
  `;

  if (!existingAddress) {
    throw createError({
      statusCode: 404,
      message: "地址不存在或无权限修改",
    });
  }

  // 5. 若is_default为true，先将其他地址设为非默认
  if (body.is_default) {
    await sql`
      UPDATE user_address
      SET is_default = false, updated_at = NOW()
      WHERE user_id = ${userId} AND id != ${Number(addressId)}
    `;
  }

  // 6. 执行更新
  try {
    const [updatedAddress] = await sql`
      UPDATE user_address
      SET 
        ${body.recipient_name !== undefined ? sql`recipient_name = ${body.recipient_name},` : sql``}
        ${body.recipient_phone !== undefined ? sql`recipient_phone = ${body.recipient_phone},` : sql``}
        ${body.province_code !== undefined ? sql`province_code = ${body.province_code},` : sql``}
        ${body.city_code !== undefined ? sql`city_code = ${body.city_code},` : sql``}
        ${body.district_code !== undefined ? sql`district_code = ${body.district_code},` : sql``}
        ${body.detail_address !== undefined ? sql`detail_address = ${body.detail_address},` : sql``}
        ${body.is_default !== undefined ? sql`is_default = ${body.is_default},` : sql``}
        updated_at = NOW()
      WHERE id = ${Number(addressId)} AND user_id = ${userId}
      RETURNING *
    `;

    console.log("✅ 地址更新成功:", updatedAddress);

    return {
      code: 200,
      msg: "更新地址成功",
      data: updatedAddress,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ 数据库更新失败:", error);

    throw createError({
      statusCode: 500,
      message: "服务器内部错误，更新地址失败",
    });
  }
});
