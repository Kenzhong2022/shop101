import type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
} from "~~/server/types/history-products";
import type { Goods } from "~~/server/types/goods";

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * API接口基础骨架
 * TODO: 根据具体业务需求修改函数名称和逻辑
 */
export default defineEventHandler(
  async (event): Promise<apihistoryProductsListResponse> => {
    // 1. 获取请求参数
    const body: apihistoryProductsListRequest = await readBody(event);
    const { page = 1, page_size = 10, searchKey, timeStart, timeEnd } = body;
    // 构建查询条件
    const token = getCookie(event, "auth-token");
    const userId = token ? parseInt(token.split(".")[0]) : null; // 按照 . 分割获取用户ID
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
        upb.created_at,  -- 保留原始时间用于外层排序
        TO_CHAR(upb.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') as created_at_fmt,
        hg.shop_name
    FROM 
        user_product_behavior upb
    INNER JOIN 
        goods hg ON upb.goods_id = hg.id::varchar
    WHERE 
        upb.user_id = ${userId}
        AND upb.behavior_type = 'click'
    ORDER BY 
        hg.id, upb.created_at DESC
) as sub
ORDER BY 
    sub.created_at DESC;
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

// 重新导出类型，供其他服务器端文件使用
export type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
} from "~~/server/types/history-products";
export type { Goods } from "~~/server/types/goods";
