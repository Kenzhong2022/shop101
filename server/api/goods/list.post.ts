//====================导入类型=========================
import type { ListRequest, ListResponse, Goods } from "~~/server/types/goods";

//====================建立数据库连接=========================
import getNeon from "~~/server/utils/neon";
// import { checkToken } from "~~/server/utils/auth";// 引入检查token的函数
const mySql = getNeon();

export default defineEventHandler(async (event): Promise<ListResponse> => {
  const body: ListRequest = await readBody(event);
  body.page = body.page || 1;
  body.page_size = body.page_size || 5;
  body.shop_name = body.shop_name || "";
  body.keyword = body.keyword || "";
  body.category_id = body.category_id || 0;

  try {
    // 动态构建条件数组和参数数组
    const conditions: string[] = [];
    const params: any[] = [];

    if (body.keyword) {
      conditions.push(`g.goods_name ILIKE $${params.length + 1}`);
      params.push(`%${body.keyword}%`);
    }
    if (body.shop_name) {
      conditions.push(`g.shop_name ILIKE $${params.length + 1}`);
      params.push(`%${body.shop_name}%`);
    }
    if (body.category_id) {
      conditions.push(`gc.category_id = $${params.length + 1}`);
      params.push(body.category_id);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // 分页参数
    params.push(body.page_size);
    params.push((body.page - 1) * body.page_size);

    // 使用参数化查询（$1, $2...）
    const query = `
      SELECT id, goods_name, image, price, stock, sort, is_show, g.average_rating,
        created_at, updated_at, shop_name
      FROM goods g 
      LEFT JOIN goods_categories gc ON g.id = gc.goods_id
      ${whereClause}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    // neon 支持 query() 方法执行参数化 SQL
    const rows = await mySql.query(query, params);
    return {
      code: 200,
      msg: "商品列表获取成功",
      data: {
        total: rows.length,
        list: rows,
      },
    } as ListResponse;
  } catch (error) {
    console.error("数据库查询错误:", error);
    return {
      code: 500,
      msg: `数据库查询错误: ${error}`,
      data: {},
    } as ListResponse;
  }
});

// 重新导出类型，供其他服务器端文件使用
export type { ListRequest, ListResponse, Goods } from "~~/server/types/goods";
