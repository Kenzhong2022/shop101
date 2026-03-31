import type {
  CreateAddressRequest,
  ApiResponse,
} from "~~/server/types/user-address";
import { requireAuth } from "~~/server/utils/auth";
//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const sql = getNeon();

/**
 * 创建地址
 * @returns 创建地址响应
 */
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  console.log("🔍 API接口被调用 ");
  const { userId } = await requireAuth(event);
  // 1. 获取请求参数
  const body: CreateAddressRequest = await readBody(event);
  console.log("📋 接收到的请求参数:", body);

  // 2. 参数验证
  const requiredFields = [
    "recipient_name",
    "recipient_phone",
    "province_code",
    "city_code",
    "district_code",
    "detail_address",
  ] as const;
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    throw createError({
      statusCode: 400,
      message: `缺少必填字段: ${missing.join(", ")}`,
    });
  }
  // 若is_default为true，且用户已存在默认地址，先更新为false
  if (body.is_default) {
    await sql`
      UPDATE user_address
      SET is_default = false
      WHERE user_id = ${userId}
    `;
  }

  // 4. 插入数据库
  try {
    const [newAddress] = await sql`
      INSERT INTO user_address (
        user_id,
        recipient_name,
        recipient_phone,
        province_code,
        city_code,
        district_code,
        detail_address,
        is_default
      ) VALUES (
        ${userId},
        ${body.recipient_name},
        ${body.recipient_phone},
        ${body.province_code},
        ${body.city_code},
        ${body.district_code},
        ${body.detail_address},
        ${body.is_default ?? false}
      )
      RETURNING *
    `;

    console.log("✅ 地址创建成功:", newAddress);

    return {
      code: 200,
      msg: "创建地址成功",
      data: newAddress,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ 数据库插入失败:", error);

    // 处理唯一约束冲突（如用户地址数量超限）
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        message: "地址数量已达上限或数据冲突",
      });
    }

    throw createError({
      statusCode: 500,
      message: "服务器内部错误，创建地址失败",
    });
  }
});
