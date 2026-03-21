/**
 * 取消过期订单
 * @description 检查并取消过期的订单
 */
import getNeon from "~~/server/utils/neon";

export default defineTask({
  meta: {
    name: "cancel-expired-orders",
    description: "检查并取消过期的订单",
  },
  async run() {
    const sql = getNeon();
    const startTime = Date.now();
    const LOCK_ID = 2026031901; // 唯一的整数锁ID
    const BATCH_SIZE = 500; // 单次处理最大订单数

    try {
      // console.log(`[Task] 开始执行取消过期订单任务`);

      // 1. 尝试获取咨询锁
      const lockResult = await sql`SELECT pg_try_advisory_lock(${LOCK_ID})`;
      const isLocked = lockResult[0].pg_try_advisory_lock;

      if (!isLocked) {
        console.log("🚫 [定时任务] 锁已被其他实例占用，跳过本次执行。");
        return { result: "success", updatedCount: 0, skipped: true };
      }

      // console.log("🔒 [定时任务] 成功获取排他锁，开始检查超时订单...");

      // 2. 开启事务
      await sql`BEGIN`;

      try {
        const now = new Date();
        // 关键：如果服务器不是 UTC 时区，这里必须转一下，或者确保驱动层处理正确
        // node-postgres 通常会自动处理 JS Date 对象到 PG timestamptz 的转换，只要服务器时区对就行。
        // 最稳妥：显式传 ISO 字符串
        const nowIso = now.toISOString();

        const orderResult = await sql`
          SELECT master_order_no 
          FROM orders_master 
          WHERE order_status = 0 
            AND expire_at <= ${nowIso}  
          ORDER BY expire_at ASC        
          LIMIT ${BATCH_SIZE}
        `;

        const orders = orderResult;

        if (orders.length === 0) {
          // console.log("ℹ️ 没有发现超时订单。");
          await sql`COMMIT`;
          return { result: "success", updatedCount: 0 };
        } else {
          console.log(`📦 发现 ${orders.length} 个超时订单，开始处理...`);

          // 4. 逐个处理订单
          let successCount = 0;
          for (const order of orders) {
            try {
              // 调用取消订单服务
              await cancelOrderTransaction(order.master_order_no, sql);
              successCount++;
            } catch (err) {
              console.error(`❌ 处理订单 ${order.master_order_no} 失败:`, err);
              // 单个订单失败继续处理下一个
            }
          }

          await sql`COMMIT`;
          console.log(
            `✅ 批次处理完成：成功 ${successCount}/${orders.length} 个订单。耗时: ${Date.now() - startTime}ms`,
          );
          return { result: "success", updatedCount: successCount };
        }
      } catch (serviceError) {
        // 业务逻辑严重错误，回滚整个批次
        await sql`ROLLBACK`;
        console.error("💥 事务执行失败，已回滚:", serviceError);
        throw serviceError;
      }
    } catch (error) {
      console.error("[Task] 取消过期订单失败:", error);
      return { result: "error", error: error };
    } finally {
      // 5. 释放锁
      try {
        await sql`SELECT pg_advisory_unlock(${LOCK_ID})`;
      } catch (unlockErr) {
        console.warn("⚠️ 释放锁时出错:", unlockErr);
      }
      console.log(`[Task] 取消过期订单任务执行完毕`);
    }
  },
});

async function cancelOrderTransaction(masterOrderNo: string, sql: any) {
  try {
    const orderItems = await sql`
      SELECT goods_id, sku_code, quantity
      FROM order_items
      WHERE order_shop_id IN (SELECT id FROM order_shops WHERE master_order_no = ${masterOrderNo})
    `;
    console.log(orderItems); // 会出现多个商品的情况
    // 1. 构建查询数组 (注意：这里只是定义查询，尚未执行)
    const queries = [
      // 更新主订单
      sql`
      UPDATE orders_master 
      SET order_status = 5, updated_at = NOW() 
      WHERE master_order_no = ${masterOrderNo}
    `,
      // 更新子订单 (店铺订单)
      sql`
      UPDATE order_shops 
      SET order_status = 5, updated_at = NOW() 
      WHERE master_order_no = ${masterOrderNo}
    `,
      // 更新订单商品
      sql`
      UPDATE order_items 
      SET item_status = 5, updated_at = NOW() 
      WHERE order_shop_id IN (SELECT id FROM order_shops WHERE master_order_no = ${masterOrderNo})
    `,
    ];
    // 恢复库存数量
    for (const item of orderItems) {
      queries.push(sql`
      UPDATE skus
      SET stock = stock + ${item.quantity}
      WHERE goods_id = ${item.goods_id} AND sku_code = ${item.sku_code}
    `);
    }

    // 2. 在事务中批量执行
    // 如果任何一条失败，整个事务会自动回滚
    await sql.transaction(queries);
    console.log(`✅ 订单 ${masterOrderNo} 事务提交成功`);
    return { success: true, message: "订单取消成功" };
  } catch (error) {
    console.error(`❌ 取消订单 ${masterOrderNo} 失败:`, error);
    throw error;
  }
}
