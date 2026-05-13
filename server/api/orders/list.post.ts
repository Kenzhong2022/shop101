/**
 * 订单列表接口
 * @description 获取用户的订单列表，支持分页和状态筛选
 */
import { defineEventHandler, readBody, createError } from "h3";
import getNeon from "~~/server/utils/neon";
import { requireAuth } from "~~/server/utils/auth";
import type {
  OrderListRequestDTO,
  OrderListResponseDTO,
  OrderItem,
} from "~~/server/types/order";
import { OrderStatus, ORDER_STATUS_LABEL_MAP } from "~~/server/types/order";

// 初始化数据库连接
const sql = getNeon();

/** 订单列表接口 */
export default defineEventHandler(
  async (event): Promise<OrderListResponseDTO> => {
    const { userId } = event.context.user;
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
    if (item_status != null && item_status !== 0) {
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
      // 3. 查询数据 (联表查询)
      const orderList = (await sql`
  SELECT 
    oi.order_shop_id,
    oi.slave_order_no,
    oi.goods_id,
    oi.goods_name,
    oi.image,
    oi.price,
    oi.quantity,
    oi.sku_code,
    oi.sku_value,
    oi.item_status,
    oi.created_at,
    oi.updated_at,
    -- 从 order_shops 表中获取额外字段
    os.address_id,
    os.shop_name,
    os.order_status as shop_order_status, -- 可选：如果需要子订单的状态
    os.payment_status as shop_payment_status, -- 可选：如果需要子订单的支付状态
    os.expire_at as shop_expire_at -- 可选：如果需要子订单的过期时间
  FROM order_items oi
  INNER JOIN order_shops os 
    ON oi.slave_order_no = os.slave_order_no  -- 关联条件：items 的子订单号 = shops 的子订单号
  ${whereClause}
  ORDER BY oi.created_at DESC
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
          OrderList: orderList.map((item) => {
            // 使用数字比较，绝对安全
            const isExpired =
              new Date(item.shop_expire_at).getTime() < new Date().getTime();
            return {
              ...item,
              is_expired: isExpired,
            };
          }),
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

// 重新导出类型和常量，供其他服务器端文件使用
export { OrderStatus, ORDER_STATUS_LABEL_MAP };
export type { OrderListRequestDTO, OrderListResponseDTO, OrderItem };
