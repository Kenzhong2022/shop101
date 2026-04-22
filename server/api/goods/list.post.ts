//====================导入类型=========================
import type { ListRequest, ListResponse, Goods } from "~~/server/types/goods";

//====================建立数据库连接=========================
import getNeon from "~~/server/utils/neon";
// import { checkToken } from "~~/server/utils/auth";// 引入检查token的函数
const mySql = getNeon();

export default defineEventHandler(async (event): Promise<ListResponse> => {
  console.log("🔍 商品列表接口被调用 ");
  // 从事件中获取请求体参数
  const body: ListRequest = await readBody(event);
  console.log("📋 接收到的请求体参数:", body);
  body.page = body.page || 1;
  body.page_size = body.page_size || 5;
  body.shop_name = body.shop_name || "";
  body.keyword = body.keyword || "";
  body.category_id = body.category_id || 0;

  // 计算偏移量 向后偏移
  const offset = (body.page - 1) * body.page_size;
  // 1. 真正的"条件片段"数组
  try {
    const { whereSql, values } = buildWhereClause(body);
    const rows = await mySql`
        SELECT id, goods_name, image, price, stock, sort, is_show, g.average_rating,
        created_at, updated_at, shop_name
        FROM goods g LEFT JOIN goods_categories gc ON g.id = gc.goods_id
        ${mySql.unsafe(whereSql)}
        ORDER BY g.average_rating DESC NULLS LAST  
        LIMIT ${body.page_size} OFFSET ${(body.page - 1) * body.page_size}`;

    // 4. 处理结果 根据贝叶斯评分
    console.log(
      "排序后的商品列表:",
      rows.map((item) => item),
    );
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
      msg: `数据库查询错误,${error}`,
      data: {},
    } as ListResponse;
  }
});

function buildWhereClause(params: ListRequest) {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.keyword) {
    conditions.push(`g.goods_name LIKE ${params.keyword}%`);
    values.push(`%${params.keyword}%`);
  }
  if (params.shop_name) {
    conditions.push(`g.shop_name LIKE ${params.shop_name}%`);
    values.push(`%${params.shop_name}%`);
  }
  if (params.category_id) {
    console.log("params.category_id:", params.category_id);
    conditions.push(`gc.category_id = ${params.category_id}`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  console.log("whereSql:", whereSql);
  return { whereSql, values };
}

// 重新导出类型，供其他服务器端文件使用
export type { ListRequest, ListResponse, Goods } from "~~/server/types/goods";
