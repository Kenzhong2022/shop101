import type {
  userBehaviorProductsGetRequest,
  userBehaviorProductsGetResponse,
} from "~~/server/types/user-behavior";

import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * 查询用户与商品是否有收藏记录
 * 根据商品ID和用户ID查询是否有收藏类型的交互记录
 */
export default defineEventHandler(
  async (event): Promise<userBehaviorProductsGetResponse> => {
    try {
      const body: userBehaviorProductsGetRequest = await readBody(event);
      const { productId } = body;

      if (!productId) {
        throw createError({
          statusCode: 400,
          message: "商品ID不能为空",
        });
      }

      const token = getCookie(event, "auth-token");
      const userId = token ? parseInt(token.split(".")[0]) : null;

      if (!userId) {
        throw createError({
          statusCode: 401,
          message: "用户未登录",
        });
      }

      const result = await mySql`
        SELECT 
            upb.id,
            upb.item_id,
            upb.action_type,
            upb.action_weight,
            TO_CHAR(upb.action_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') as action_time,
            hg.goods_name,
            hg.image,
            hg.price
        FROM 
            user_item_action upb
        INNER JOIN 
            goods hg ON upb.item_id = hg.id
        WHERE 
            upb.user_id = ${userId}
            AND upb.item_id = ${productId}
            AND upb.action_type = 2
        LIMIT 1
      `;

      if (result.length === 0) {
        return {
          code: 200,
          msg: "未找到收藏记录",
          data: null,
        };
      }

      const record = result[0];

      return {
        code: 200,
        msg: "查询成功",
        data: {
          id: record.id,
          item_id: record.item_id,
          goods_name: record.goods_name,
          image: record.image,
          price: record.price,
          action_type: record.action_type,
          action_weight: record.action_weight,
          action_time: record.action_time,
        },
      };
    } catch (error) {
      console.error("❌ 查询用户收藏记录失败:", error);
      throw createError({
        statusCode: 500,
        message: "查询用户收藏记录失败",
      });
    }
  },
);

export type {
  userBehaviorProductsGetRequest,
  userBehaviorProductsGetResponse,
} from "~~/server/types/user-behavior";
