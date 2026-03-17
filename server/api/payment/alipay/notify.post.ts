// server/api/payment/alipay/notify.post.ts
import { defineEventHandler, readBody, setResponseHeaders } from "h3";
import { AlipaySdk } from "alipay-sdk";

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

    // --- 以下保持你原有的优秀逻辑 ---
    const orderNo = body.out_trade_no; // 支付宝订单号
    const tradeStatus = body.trade_status; // 支付宝订单状态

    if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISHED") {
      console.log("⏳ 订单状态无需处理:", tradeStatus);
      return "success";
    }

    // 模拟数据库查询 (记得替换成真实代码)
    const order = await getOrderFromDB(orderNo);
    if (!order) {
      console.error("❌ 订单不存在:", orderNo);
      return "fail";
    }

    // 5️⃣ 验证金额
    const notifyAmount = parseFloat(body.total_amount);
    if (order.amount !== notifyAmount) {
      console.error("❌ 金额不匹配:", order.amount, "vs", notifyAmount);
      return "fail";
    }

    if (order.status === "paid") {
      console.log("✅ 订单已处理，直接返回成功 (幂等性)");
      return "success";
    }

    await updateOrderStatus(orderNo, {
      status: "paid",
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

// --- 模拟函数 (保持不变) ---
async function getOrderFromDB(orderNo: string) {
  // TODO: 替换为真实 DB 查询
  // 为了测试，这里硬编码允许任何订单号为 "ORDER_..." 的通过
  if (orderNo.startsWith("ORDER_")) {
    return { orderNo, amount: 0.01, status: "pending" };
  }
  return null;
}

async function updateOrderStatus(orderNo: string, data: any) {
  console.log("📝 [DB] 更新订单:", orderNo, data);
}
