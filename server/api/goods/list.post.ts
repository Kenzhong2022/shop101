//====================建立数据结构=========================
export interface ListRequest {
  shop_name?: string; // 店铺名称
  category_id?: number; // 分类ID
  page: number; // 页码
  page_size: number; // 每页数量
}

export interface Goods {
  id: number; // 商品ID
  goods_name: string; // 商品名称 (对应数据库字段)
  image: string; // 商品图片
  price: number; // 商品价格
  stock: number; // 商品库存
  sort: number; // 排序字段
  is_show: number; // 是否显示 (1:显示, 0:隐藏)
  sales?: number; // 商品销售量 (可选，可能是计算字段)
  created_at: string; // 创建时间 (对应数据库字段)
  updated_at: string; // 更新时间 (对应数据库字段)
  shop_name: string; // 店铺名称
  category_id?: number; // 分类ID
  [key: string]: any; // 后续追加字段
}
export interface ListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: {
    total: number; // 总数量
    list: Goods[]; // 商品列表
  };
}

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
  body.category_id = body.category_id || 0;
  // 计算偏移量 向后偏移
  const offset = (body.page - 1) * body.page_size;
  // 1. 真正的“条件片段”数组
  try {
    const cond = [];
    const values = [];

    if (body.shop_name) {
      cond.push(`shop_name LIKE ?`);
      values.push(`%${body.shop_name}%`); // 通配符在这里包
    }
    if (body.category_id) {
      cond.push(`category_id = ?`);
      values.push(body.category_id);
    }

    // 2. 拼 WHERE 子句
    const whereSql = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

    // 3. 一次性执行
    const rows = await mySql`
        SELECT id, goods_name, image, price, stock, sort, is_show, average_rating,
        created_at, updated_at, shop_name
        FROM homepage_goods
        ${mySql.unsafe(whereSql)}
        ORDER BY average_rating DESC NULLS LAST  -- 降序，NULL 放最后
        LIMIT ${body.page_size || 5} OFFSET ${
          (body.page - 1) * (body.page_size || 5)
        }`;

    console.log("数据库查询结果:", rows);
    // 4. 处理结果 根据贝叶斯评分

    console.log(
      "排序后的商品列表:",
      rows.map((item) => item.average_rating),
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
