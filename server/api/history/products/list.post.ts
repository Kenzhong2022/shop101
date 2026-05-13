import type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
} from "~~/server/types/history-products";
import type { Goods } from "~~/server/types/goods";

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
import { defineEventHandler, readBody } from "h3";
import { requireAuth } from "~~/server/utils/auth";
const mySql = getNeon();

/**
 * API接口基础骨架
 */
export default defineEventHandler(
  async (event): Promise<apihistoryProductsListResponse> => {
    // 1. 使用JWT认证获取用户ID
    const { userId } = event.context.user;
    console.log("userId", userId);
    // 2. 获取请求参数
    const body: apihistoryProductsListRequest = await readBody(event);
    const {
      page = 1,
      page_size = 10,
      searchKey,
      timeStart,
      timeEnd,
      action_type,
    } = body;

    /**通过子查询拿到每个商品的最新查看记录，之后根据时间排序 */
    const result = (await mySql`
SELECT 
    id, goods_name, image, price, stock, sort, 
    is_show, average_rating, created_at_fmt, shop_name
FROM (
    SELECT DISTINCT ON (hg.id)
        hg.id,
        hg.goods_name,
        hg.image,
        hg.price,
        hg.stock,
        hg.sort,
        hg.is_show,
        hg.average_rating,
        upb.action_time,
        TO_CHAR(upb.action_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') as created_at_fmt,
        hg.shop_name
    FROM 
        user_item_action upb
    INNER JOIN 
        goods hg ON upb.item_id = hg.id
    WHERE 
        upb.user_id = ${userId}
        AND upb.action_type = ${action_type}
    ORDER BY 
        hg.id, upb.action_time DESC
) as sub
ORDER BY 
    sub.action_time DESC;
`) as Goods[];

    return {
      code: 200,
      msg: "成功",
      data: {
        total: result.length,
        GoodsItems: result,
      },
    };
  },
);

// 重新导出类型
export type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
} from "~~/server/types/history-products";
export type { Goods } from "~~/server/types/goods";
