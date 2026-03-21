// server/api/payment/alipay/create.post.ts
import { defineEventHandler, readBody, sendError, createError } from "h3";
import { AlipaySdk } from "alipay-sdk";
import getNeon from "~~/server/utils/neon";
const sql = getNeon();
export default defineEventHandler(async (event) => {
  try {
    // 1️⃣ 获取前端传来的参数
    const body = await readBody(event);
    const { orderId, amount, subject } = body;

    if (!orderId || !amount) {
      throw createError({
        statusCode: 400,
        statusMessage: "订单ID和金额不能为空",
      });
    }

    // 2️⃣ 查询数据库验证订单
    const order = await getOrderById(orderId);
    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: "订单不存在",
      });
    }
    console.log(
      `✅ 验证订单: ${orderId}, 金额: ${order.amount},amount:${amount}`,
    );

    if (parseFloat(order.amount) !== parseFloat(amount)) {
      throw createError({
        statusCode: 400,
        statusMessage: "金额不匹配",
      });
    }
    if (order.status !== "pending") {
      throw createError({
        statusCode: 400,
        statusMessage: "订单状态异常",
      });
    }
    const goodsImage = "good_7_vb57qo";

    // 3️⃣ 初始化支付宝 SDK
    const alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID || "",
      privateKey: process.env.ALIPAY_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
      alipayPublicKey:
        process.env.ALIPAY_PUBLIC_KEY?.replace(/\\n/g, "\n") || "",
      gateway: "https://openapi-sandbox.dl.alipaydev.com/gateway.do", // 沙箱环境网关
      signType: "RSA2",
      charset: "utf-8",
      version: "1.0",
      keyType: "PKCS8", // 重要：Nuxt/Node环境通常需要指定 PKCS8
    });
    // 4️⃣ 构建业务参数
    const bizContent = {
      out_trade_no: orderId, // 商户订单号 (用你的订单ID)
      total_amount: parseFloat(amount).toFixed(2), // 金额
      subject: subject || "ChainPay订单", // 订单标题
      product_code: "FAST_INSTANT_TRADE_PAY", // 产品码
      goods_detail: [
        {
          goods_id: "123456", // 商品ID
          goods_name: "测试商品", // 商品名称
          quantity: 1, // 商品数量
          price: parseFloat(amount).toFixed(2), // 商品单价
          show_url: `https://res.cloudinary.com/dlji1nmdj/image/upload/c_fill,w_280,h_280,g_auto/f_auto/q_80/v1763887762/${goodsImage}?_a=BBDAAEAE0`, // 商品展示URL
        },
      ],
      // 商品详情
      timeout_express: "30m", // 超时时间
    };
    // 打印环境配置，检查是否正确
    console.log("ALIPAY_RETURN_URL:", process.env.ALIPAY_RETURN_URL);
    console.log("ALIPAY_NOTIFY_URL:", process.env.ALIPAY_NOTIFY_URL);
    // 5️⃣ 生成支付表单 HTML
    // pageExecute 会返回一段 HTML 代码，前端执行后会自动跳转支付宝
    const formHtml = alipaySdk.pageExecute(
      "alipay.trade.page.pay",
      "POST", // 推荐用 POST，兼容性更好
      {
        bizContent,
        returnUrl: `${process.env.ALIPAY_RETURN_URL}?orderId=${orderId}`,
        notifyUrl: process.env.ALIPAY_NOTIFY_URL,
      },
    );

    // 6️⃣ 返回给前端
    // 方案 A: 直接返回 HTML 字符串，前端用 iframe 或新窗口打开
    // 方案 B: 返回 URL (如果是手机支付可能需要不同处理)

    return {
      success: true,
      message: "支付链接生成成功",
      data: {
        html: formHtml, // 前端拿到这个 HTML 写入页面即可跳转
        orderId: orderId,
      },
    };
  } catch (error: any) {
    console.error("❌ 创建支付订单失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "支付初始化失败: " + error.message,
    });
  }
});

// 订单查询函数
async function getOrderById(orderId: string) {
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
