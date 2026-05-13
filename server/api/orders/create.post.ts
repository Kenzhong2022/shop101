// server/api/orders/create.post.ts
import { defineEventHandler, readBody, createError } from "h3";
import dayjs from "dayjs";
import getNeon from "~~/server/utils/neon";

import type {
  CreateOrderRequestDTO,
  OrderItemData,
  SubOrderData,
  OrderCreateResponse,
  SubOrderVO,
} from "~~/server/types/order";

// 初始化数据库连接
const sql = getNeon();

// ==================== 1. 类型定义 ====================

/** 购物车项（来自前端） */
export interface CartItemRequest {
  id: number; // 购物车记录ID，用于清理
  goods_id: number;
  goods_name: string;
  shop_name: string;
  shop_id: number;
  image: string;
  price: string; // 前端传来的是字符串，需要转数字
  quantity: number;
  stock: number; // 仅用于前端展示
  sku_code: string;
  sku_value: string;
}

/** 返回给前端的商品项 VO */
export interface OrderItemVO {
  goodsId: number;
  goodsName: string;
  quantity: number;
  priceDisplay: string;
  totalDisplay: string;
  skuInfo: string;
  image: string;
  shopName: string;
}

// ==================== 2. 辅助函数 ====================

/**
 * 生成主订单号（基于 sequence 表）
 */
async function generateMasterOrderNo(): Promise<string> {
  const date = dayjs().format("YYYYMMDD");
  const result = await sql`
    INSERT INTO order_sequence (seq_date, seq_value)
    VALUES (${date}, 1)
    ON CONFLICT (seq_date) DO UPDATE
    SET seq_value = order_sequence.seq_value + 1
    RETURNING seq_value
  `;
  const seq = result[0].seq_value;
  return `${date}${String(seq).padStart(8, "0")}`;
}

/**
 * 生成子订单号 = 主订单号 + 两位序号
 */
function generateSlaveOrderNo(masterOrderNo: string, index: number): string {
  return `${masterOrderNo}${String(index).padStart(2, "0")}`;
}

/**
 * 格式化金额显示
 */
function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 获取订单状态标签
 */
function getOrderStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: "待付款",
    1: "待发货",
    2: "待收货",
    3: "待评价",
    4: "已完成",
    5: "已取消",
  };
  return map[statusCode] || "未知状态";
}

/**
 * 获取支付状态标签
 */
function getPaymentStatusLabel(statusCode: number): string {
  const map: Record<number, string> = {
    0: "待付款",
    1: "已付款",
  };
  return map[statusCode] || "未知状态";
}

// ==================== 3. 主事件处理函数 ====================

export default defineEventHandler(
  async (event): Promise<OrderCreateResponse> => {
    try {
      const { userId } = event.context.user;

      // 2. 解析请求体
      const body = await readBody<CreateOrderRequestDTO>(event);
      const { items, address_id, remark } = body;

      // 3. 基础校验
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "创建订单参数不能为空",
        });
      }

      // 4. 按店铺分组
      const shopGroups = items.reduce<Record<number, CartItemRequest[]>>(
        (acc, item) => {
          if (!acc[item.shop_id]) acc[item.shop_id] = [];
          acc[item.shop_id].push(item);
          return acc;
        },
        {},
      );

      // 5. 生成主订单号 & 时间
      const masterOrderNo = await generateMasterOrderNo();
      const createdAt = new Date();
      const expireAt = new Date(createdAt.getTime() + 30 * 60 * 1000); // 30分钟

      const internalSubOrders: SubOrderData[] = []; // 最后插入order_shops表
      let globalTotalAmount = 0;
      let shopIndex = 0;

      // ============================================================
      // 前置检查：查询最新价格和库存（非事务，用于初步校验）
      // ============================================================
      for (const [shopId, shopItems] of Object.entries(shopGroups)) {
        const slaveOrderNo = generateSlaveOrderNo(masterOrderNo, shopIndex++);
        let shopTotal = 0;
        const orderItems: OrderItemData[] = [];

        for (const item of shopItems) {
          // 查询 SKU 信息（价格、库存）
          const skuRows = await sql`
            SELECT stock, price FROM skus
            WHERE goods_id = ${item.goods_id} AND sku_code = ${item.sku_code}
          `;

          if (skuRows.length === 0) {
            throw createError({
              statusCode: 400,
              statusMessage: `商品 ${item.goods_name} 不存在`,
            });
          }

          const currentStock = skuRows[0].stock;
          const safePrice = parseFloat(skuRows[0].price) || 0;

          if (currentStock < item.quantity) {
            throw createError({
              statusCode: 400,
              statusMessage: `商品 ${item.goods_name} 库存不足 (剩余: ${currentStock})`,
            });
          }

          const itemTotal = safePrice * item.quantity;
          shopTotal += itemTotal;

          // 构建订单表中的记录数据
          orderItems.push({
            goods_id: item.goods_id,
            goods_name: item.goods_name,
            quantity: item.quantity,
            price: safePrice,
            total: itemTotal,
            sku_code: item.sku_code,
            sku_value: item.sku_value,
            image: item.image,
            shop_name: item.shop_name,
            shop_id: Number(shopId),
            slave_order_no: slaveOrderNo,
          });
        }

        if (shopTotal <= 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `店铺 ${shopId} 订单金额异常`,
          });
        }

        globalTotalAmount += shopTotal;

        // 构建子订单表中的记录数据
        internalSubOrders.push({
          slave_order_no: slaveOrderNo,
          master_order_no: masterOrderNo,
          shop_id: Number(shopId),
          shop_name: shopItems[0].shop_name,
          total_amount: shopTotal,
          payment_amount: shopTotal,
          discount_amount: 0,
          order_status: 0,
          payment_status: 0,
          shipping_status: 0,
          address_id: address_id,
          remark: remark || "",
          items: orderItems,
          created_at: createdAt,
          expire_at: expireAt,
        });
      }

      if (globalTotalAmount <= 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "订单总金额必须大于0",
        });
      }

      // ============================================================
      // 构建 SQL 语句数组（事务内顺序执行）
      // ============================================================
      const statements = [];

      // 1. 插入主订单
      statements.push(sql`
        INSERT INTO orders_master (
          master_order_no, user_id, total_amount, payment_amount, discount_amount,
          order_status, payment_status, created_at, expire_at
        ) VALUES (
          ${masterOrderNo}, ${userId}, ${globalTotalAmount}, ${globalTotalAmount}, 0,
          0, 0, ${createdAt}, ${expireAt}
        )
      `);

      // 2. 遍历子订单表，循环生成插入记录的sql语句
      for (const sub of internalSubOrders) {
        // 插入子订单（master_id 通过子查询获取）
        statements.push(sql`
          INSERT INTO order_shops (
            master_id, slave_order_no, master_order_no,
            shop_id, shop_name,
            total_amount, payment_amount, discount_amount,
            order_status, payment_status, shipping_status,
            address_id, remark,
            created_at, expire_at, user_id
          ) VALUES (
            (SELECT id FROM orders_master WHERE master_order_no = ${masterOrderNo}),
            ${sub.slave_order_no}, ${sub.master_order_no},
            ${sub.shop_id}, ${sub.shop_name},
            ${sub.total_amount}, ${sub.payment_amount}, ${sub.discount_amount},
            ${sub.order_status}, ${sub.payment_status}, ${sub.shipping_status},
            ${sub.address_id}, ${sub.remark || null},
            ${sub.created_at}, ${sub.expire_at}, ${userId}
          )
        `);

        // 主订单会从多个店铺购买多个商品，一个主订单会有多个子订单，n个子订单对应n个店铺数量，每个子订单会包含多个商品明细
        for (const item of sub.items) {
          statements.push(sql`
            INSERT INTO order_items (
              order_shop_id, goods_id, goods_name, quantity, price, total,
              sku_code, sku_value, image, shop_name, shop_id,slave_order_no, user_id
            ) VALUES (
              (SELECT id FROM order_shops WHERE slave_order_no = ${sub.slave_order_no}),
              ${item.goods_id}, ${item.goods_name}, ${item.quantity}, ${item.price}, ${item.total},
              ${item.sku_code}, ${item.sku_value}, ${item.image}, ${item.shop_name}, ${item.shop_id}, ${item.slave_order_no}, ${userId}
            )
          `);

          // 扣减 SKU 库存（原子操作）
          statements.push(sql`
            UPDATE skus
            SET stock = stock - ${item.quantity}, updated_at = NOW()
            WHERE goods_id = ${item.goods_id}
              AND sku_code = ${item.sku_code}
              AND stock >= ${item.quantity}
          `);

          // 扣减商品主表库存（如果业务需要）
          statements.push(sql`
            UPDATE goods
            SET stock = stock - ${item.quantity}, updated_at = NOW()
            WHERE id = ${item.goods_id} AND stock >= ${item.quantity}
          `);
        }
      }

      // 3. （可选）清理购物车
      if (items.length > 0) {
        const itemIds = items.map((i) => i.id);
        statements.push(sql`
          DELETE FROM cart_items
          WHERE user_id = ${userId} AND id = ANY(${itemIds})
        `);
      }

      // ============================================================
      // 执行事务
      // ============================================================
      console.log("🚀 开始执行事务");
      const results = await sql.transaction(statements);
      console.log("✅ 事务执行完成", results);

      // ============================================================
      // 验证库存扣减结果（检查每个 UPDATE 的受影响行数）
      // ============================================================
      // results 数组顺序与 statements 完全一致
      // 我们需要找出所有 UPDATE 语句，并确认它们都成功更新了行
      // 注意：Neon 返回的 UPDATE 结果结构可能为 { count: 1 } 或 { rowCount: 1 }
      // 以下以 count 为例，请根据实际打印的 results 调整属性名
      // for (let i = 0; i < statements.length; i++) {
      //   const stmt = statements[i];
      //   // 粗略判断是否为 UPDATE 语句（可根据字符串内容，但不精确）
      //   // 更可靠的方式是记录每个 UPDATE 语句的索引，但为简化，我们尝试检查结果中是否有 count 属性
      //   const res = results[i];
      //   if (res && typeof res === "object" && "count" in res) {
      //     if (res.count === 0) {
      //       // 如果影响行数为 0，说明库存不足，抛错回滚（但事务已提交，需手动处理？）
      //       // 注意：事务已经提交，这里抛错无法回滚，只能记录并返回错误
      //       // 理想情况下应在事务内检查，但数组事务无法做到，此处作为兜底
      //       console.error(`❌ 第 ${i} 条 UPDATE 影响行数为 0，可能库存不足`);
      //       throw new Error("库存不足，订单创建失败");
      //     }
      //   }
      // }

      // ============================================================
      // 构建返回 VO
      // ============================================================
      const subOrdersVO: SubOrderVO[] = internalSubOrders.map((sub) => ({
        orderNo: sub.slave_order_no,
        shopId: sub.shop_id,
        shopName: sub.shop_name,
        amountDisplay: formatMoney(sub.payment_amount),
        itemCount: sub.items.length,
        statusLabel: getOrderStatusLabel(sub.order_status),
        paymentStatusLabel: getPaymentStatusLabel(sub.payment_status),
        items: sub.items.map((item) => ({
          goodsId: item.goods_id,
          goodsName: item.goods_name,
          quantity: item.quantity,
          priceDisplay: formatMoney(item.price),
          totalDisplay: formatMoney(item.total),
          skuInfo: item.sku_value,
          image: item.image,
          shopName: item.shop_name,
        })),
      }));

      return {
        code: 200,
        msg: "订单创建成功，请尽快支付",
        data: {
          masterOrderNo,
          subOrders: subOrdersVO,
          totalAmountDisplay: formatMoney(globalTotalAmount),
          createdAt: createdAt.toISOString(),
          expireTime: expireAt.toISOString(),
        },
      };
    } catch (error: any) {
      console.error("❌ 创建订单失败:", error);
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: "订单创建失败: " + (error.message || "未知系统错误"),
      });
    }
  },
);
