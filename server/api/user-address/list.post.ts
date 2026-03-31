import type {
  AddressListResponse,
  UserAddress,
} from "~~/server/types/user-address";
import { requireAuth } from "~~/server/utils/auth";
//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const sql = getNeon();

/**
 * 创建地址
 * @returns 创建地址响应
 */
export default defineEventHandler(
  async (event): Promise<AddressListResponse> => {
    console.log("🔍 API接口被调用 ");
    const { userId } = await requireAuth(event);

    //查询数据库获取地址列表
    try {
      const addresses =
        await sql`SELECT * FROM user_address WHERE user_id = ${userId}`;
      return {
        code: 200,
        msg: "查询地址列表成功",
        data: {
          list: addresses as UserAddress[],
          total: addresses.length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        message: "服务器内部错误，创建地址失败",
      });
    }
  },
);
