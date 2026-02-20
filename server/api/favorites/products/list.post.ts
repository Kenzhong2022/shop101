import { Goods } from "../../goods/list.post";
// 请求参数 分页 时间区间 key值
export interface apiFavoritesProductsListRequest {
  searchKey?: string; // 搜索关键词（可选）
  timeStart?: number; // 时间开始（可选）
  timeEnd?: number; // 时间结束（可选）
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
}

export interface apiFavoritesProductsListResponseData {
  total: number; // 总记录数
  GoodsItems: Goods[]; // 商品列表
}

// 响应数据 分页 时间区间 key值
export interface apiFavoritesProductsListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: apiFavoritesProductsListResponseData;
}

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * API接口基础骨架
 * TODO: 根据具体业务需求修改函数名称和逻辑
 */
export default defineEventHandler(
  async (event): Promise<apiFavoritesProductsListResponse> => {
    console.log("🔍 API接口被调用 ");
    // 1. 获取请求参数
    const body: apiFavoritesProductsListRequest = await readBody(event);
    console.log("📋 接收到的请求参数:", body);
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
        homepage_goods hg ON upb.goods_id = hg.id::varchar
    WHERE 
        upb.user_id = ${userId}
        AND upb.behavior_type = 'click'
    ORDER BY 
        hg.id, upb.created_at DESC
) as sub
ORDER BY 
    sub.created_at DESC;
`) as Goods[];
    console.log("查询结果:", result);

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
