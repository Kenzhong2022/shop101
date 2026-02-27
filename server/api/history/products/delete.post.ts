// 删除历史记录商品接口

// 请求参数 - 商品ID数组
export interface apihistoryProductsDeleteRequest {
  productIds: number[]; // 要删除的商品ID数组
}

// 响应数据
export interface apihistoryProductsDeleteResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: {
    deletedCount: number; // 删除的记录数量
  };
}

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * 删除历史记录商品接口
 * 根据商品ID数组删除用户的历史浏览记录
 */
export default defineEventHandler(
  async (event): Promise<apihistoryProductsDeleteResponse> => {
    try {
      // 1. 获取请求参数
      const body: apihistoryProductsDeleteRequest = await readBody(event);
      const { productIds } = body;

      // 2. 验证参数
      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.length === 0
      ) {
        throw createError({
          statusCode: 400,
          statusMessage: "商品ID数组不能为空",
        });
      }

      // 3. 获取用户ID
      const token = getCookie(event, "auth-token");
      const userId = token ? parseInt(token.split(".")[0]) : null;

      if (!userId) {
        throw createError({
          statusCode: 401,
          statusMessage: "用户未登录",
        });
      }

      // 4. 执行删除操作
      const deleteResult = await mySql`
        DELETE FROM user_product_behavior 
        WHERE user_id = ${userId} 
        AND goods_id = ANY(${productIds})
        AND behavior_type = 'click'
        RETURNING *
      `;

      return {
        code: 200,
        msg: "删除成功",
        data: {
          deletedCount: deleteResult.length || 0,
        },
      };
    } catch (error) {
      console.error("❌ 删除历史记录失败:", error);

      // 返回错误响应
      throw createError({
        statusCode: 500,
        statusMessage: "删除历史记录失败",
      });
    }
  },
);
