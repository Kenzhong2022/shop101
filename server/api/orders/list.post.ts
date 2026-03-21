/** 订单列表请求参数 */
export interface OrderListRequestDTO {
  order_shop_id?: number;
  goods_name?: string;
  sku_code?: string;
  sku_value?: string;
  shop_name?: string;
  item_status?: number;
  created_at?: string | Date; // 前端传过来通常是字符串
  updated_at?: string | Date;
  page?: number;
  pageSize?: number;
}

/** 内部订单项（商品维度） */
export interface OrderItem {
  order_shop_id: number;
  slave_order_no: string;
  goods_id: number;
  goods_name: string;
  image: string;
  price: number;
  quantity: number;
  sku_code: string;
  sku_value: string;
  shop_name: string;
  item_status: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface OrderListResponseDTO {
  code: number;
  msg: string;
  data: {
    OrderList: OrderItem[]; // 建议定义具体的 Item 类型
    total?: number;
  };
}

import { defineEventHandler, readBody, createError } from "h3";
import getNeon from "~~/server/utils/neon";
import { requireAuth } from "~~/server/utils/auth";

// 初始化数据库连接
const sql = getNeon();

export default defineEventHandler(
  async (event): Promise<OrderListResponseDTO> => {
    const { userId } = await requireAuth(event);
    if (!userId) throw createError({ statusCode: 401, message: "用户未登录" });

    const body: OrderListRequestDTO = await readBody(event);
    const {
      order_shop_id,
      goods_name,
      sku_code,
      sku_value,
      shop_name,
      item_status,
      created_at,
      updated_at,
      page = 1,
      pageSize = 20,
    } = body;

    // 1. 动态构建条件数组（每个条件都是 sql 片段）
    const conditions: any[] = [];

    if (order_shop_id != null)
      conditions.push(sql`order_shop_id = ${order_shop_id}`);
    if (item_status != null && item_status !== 5) {
      conditions.push(sql`item_status = ${item_status}`);
    }
    if (goods_name)
      conditions.push(sql`goods_name LIKE ${"%" + goods_name + "%"}`);
    if (sku_code) conditions.push(sql`sku_code LIKE ${"%" + sku_code + "%"}`);
    if (sku_value)
      conditions.push(sql`sku_value LIKE ${"%" + sku_value + "%"}`);
    if (shop_name)
      conditions.push(sql`shop_name LIKE ${"%" + shop_name + "%"}`);
    if (created_at) conditions.push(sql`created_at >= ${new Date(created_at)}`);
    if (updated_at) conditions.push(sql`updated_at <= ${new Date(updated_at)}`);

    // 2. 使用 reduce 构建 WHERE 子句（替代 sql.join）
    const whereClause =
      conditions.length > 0
        ? conditions.reduce(
            (acc, cond, index) => {
              if (index === 0) return sql`WHERE ${cond}`;
              return sql`${acc} AND ${cond}`;
            },
            sql``,
          )
        : sql``;

    const offset = (page - 1) * pageSize;

    try {
      // 3. 查询数据
      const orderList = (await sql`
        SELECT 
          order_shop_id,
          slave_order_no,
          goods_id,
          goods_name,
          image,
          price,
          quantity,
          sku_code,
          sku_value,
          shop_name,
          item_status,
          created_at,
          updated_at
        FROM order_items
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `) as OrderItem[];
      console.log(orderList);
      // 4. 查询总数（分页用）
      const countResult = await sql`
        SELECT COUNT(*) as count 
        FROM order_items
        ${whereClause}
      `;
      const total = Number(countResult[0].count);

      return {
        code: 200,
        msg: "获取订单列表成功",
        data: {
          OrderList: orderList,
          total,
        },
      };
    } catch (error) {
      console.error("❌ 数据库查询失败:", error);
      throw createError({
        statusCode: 500,
        message: "服务器内部错误",
        cause: error,
      });
    }
  },
);
