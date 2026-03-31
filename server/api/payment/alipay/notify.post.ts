// server/api/payment/alipay/notify.post.ts
import { defineEventHandler, readBody, setResponseHeaders } from "h3";
import { AlipaySdk } from "alipay-sdk";
import getNeon from "~~/server/utils/neon";
const sql = getNeon();
export default defineEventHandler(async (event) => {
  // 1️⃣ 【新增】设置响应头，允许支付宝跨域访问 (解决部分 403/ CORS 问题)
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // 处理 OPTIONS 预检请求 (某些网关会先发这个)
  if (event.method === "OPTIONS") {
    return "";
  }

  console.log("📥 收到支付宝回调请求");

  try {
    // 2️⃣ 获取回调参数
    // 注意：如果这里依然报错 403，说明是 Nuxt 全局 CSRF 拦截，需看下方的"终极方案"
    const body = await readBody(event);

    if (!body || Object.keys(body).length === 0) {
      console.error("❌ 未读取到任何参数，Body 为空");
      return "fail";
    }

    console.log("📥 回调数据:", body);
    console.log("订单号:", body.out_trade_no);

    // ... (后续逻辑保持不变) ...

    // 3️⃣ 初始化 SDK (注意密钥格式处理)
    const alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID || "",
      // ⚠️ 关键：处理 .env 中的换行符，防止签名失败
      privateKey: process.env.ALIPAY_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
      alipayPublicKey:
        process.env.ALIPAY_PUBLIC_KEY?.replace(/\\n/g, "\n") || "",
      // 沙箱环境建议显式指定网关，虽然 checkNotifySign 不需要网关，但保持一致性好
      gateway: "https://openapi-sandbox.dl.alipaydev.com/gateway.do",
      signType: "RSA2",
      charset: "utf-8",
      keyType: "PKCS8",
    });

    // 4️⃣ 验证签名
    const isValid = await alipaySdk.checkNotifySign(body);
    if (!isValid) {
      console.error(
        "❌ 签名验证失败。请检查：1.公钥是否正确 2.密钥格式是否有换行问题",
      );
      // 调试用：打印签名字段
      console.log("收到的 sign:", body.sign);
      return "fail";
    }
    console.log("✅ 签名验证通过");

    const orderNo = body.out_trade_no; // 支付宝订单号
    const tradeStatus = body.trade_status; // 支付宝订单状态
    console.log("orderNo:", orderNo, "tradeStatus:", tradeStatus);
    if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISHED") {
      console.log("⏳ 订单状态无需处理:", tradeStatus);
      return "success";
    }
    let order = null;
    if (orderNo.length === 18) {
      // 子订单号
      order = await getOrderBySlaveOrderId(orderNo);
    } else {
      // 主订单号
      order = await getOrderByMasterOrderId(orderNo);
    }

    if (!order) {
      console.error("❌ 订单不存在:", orderNo);
      return "fail";
    }

    // 5️⃣ 验证金额
    if (parseFloat(order.amount) !== parseFloat(body.total_amount)) {
      console.error("❌ 金额不匹配:", order.amount, "vs", body.total_amount);
      return "fail";
    }

    if (order.status === "paid") {
      console.log("✅ 订单已处理，直接返回成功 (幂等性)");
      return "success";
    }

    await updateOrderStatusByMasterOrderId(orderNo, {
      status: tradeStatus,
      alipayTradeNo: body.trade_no,
      paidAt: new Date(),
      buyerId: body.buyer_id,
    });

    console.log("✅ 订单更新成功");
    return "success";
  } catch (error) {
    console.error("❌ 回调处理异常:", error);
    return "fail";
  }
});

/**
 * 根据订单号查询订单
 * @param orderId 订单号
 * @returns 订单信息
 */
async function getOrderByMasterOrderId(orderId: string) {
  const order =
    await sql`select master_order_no, payment_status, order_status, total_amount from orders_master where master_order_no = ${orderId}`;
  if (!order) {
    return null;
  }
  const { master_order_no, payment_status, order_status, total_amount } =
    order[0];
  if (order_status === 0 && payment_status === 0) {
    return {
      id: master_order_no,
      amount: total_amount,
      status: "pending",
    };
  }
  return null;
}

async function getOrderBySlaveOrderId(orderId: string) {
  const order =
    await sql`select slave_order_no, payment_status, order_status, total_amount from order_shops where slave_order_no = ${orderId}`;
  if (!order) {
    return null;
  }
  const { slave_order_no, payment_status, order_status, total_amount } =
    order[0];
  if (order_status === 0 && payment_status === 0) {
    return {
      id: slave_order_no,
      amount: total_amount,
      status: "pending",
    };
  }
  return null;
}

/**
 * 更新订单状态
 * @param orderId 订单号
 * @param updateData 更新数据
 */
async function updateOrderStatusByMasterOrderId(
  orderId: string,
  updateData: {
    status: string;
    alipayTradeNo: string;
    paidAt: Date;
    buyerId: string;
  },
) {
  const { status } = updateData;
  console.log("status:", status); // TRADE_SUCCESS, TRADE_FINISHED
  const statusMap = {
    TRADE_SUCCESS: {
      payment_status: 1,
      order_status: 1,
      item_status: 2, // 1: 待支付 2: 已支付/待发货 3: 已发货 4: 已签收 5: 已取消
    },
  } as Record<
    string,
    { payment_status: number; order_status: number; item_status: number }
  >;
  const updateQueries = [];
  if (orderId.length === 18) {
    updateQueries.push(
      sql`
      update orders_master
      set order_status = ${statusMap[status].order_status}
      where master_order_no = ${orderId}
    `,
    );
  }
  updateQueries.push(
    // 2. 更新子订单表 (order_shops)
    sql`
    update order_shops
    set payment_status = ${statusMap[status].payment_status}, order_status = ${statusMap[status].order_status}
    where master_order_no = ${orderId}
  `,
  );
  updateQueries.push(
    // 3. 更新子订单的所有商品项 (order_items)
    sql`
    update order_items
    set item_status = ${statusMap[status].item_status}
    where slave_order_no IN (
      select slave_order_no from order_shops where master_order_no = ${orderId}
    )
  `,
  );
  console.log("updateQueries:", updateQueries);
  await sql.transaction(updateQueries);
}
