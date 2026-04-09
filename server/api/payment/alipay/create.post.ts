// server/api/payment/alipay/create.post.ts
import { defineEventHandler, readBody, sendError, createError } from "h3";
import { AlipaySdk } from "alipay-sdk";
import getNeon from "~~/server/utils/neon";
const sql = getNeon();
export default defineEventHandler(async (event) => {
  try {
    // 主订单号/子订单号、金额、订单标题
    const body = await readBody(event);
    const { orderInfo, orderId, amount, subject, addressId } = body;
    console.log("orderInfo", orderInfo, addressId);
    if (!orderId || !amount || !addressId) {
      throw createError({
        statusCode: 400,
        statusMessage: "订单ID、金额和地址不能为空",
      });
    }

    let order = null;
    // 2️⃣ 查询数据库验证订单是否存在
    if (orderId.length === 18) {
      order = await getOrderBySlaveOrderId(orderId);
      // 更新订单收货地址
      await updateOrderAddressBySlaveOrderId(orderId, addressId);
    } else {
      order = await getOrderByMasterOrderId(orderId);
      // 更新订单收货地址
      await updateOrderAddressByMasterOrderId(orderId, addressId);
    }
    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: "订单不存在",
      });
    }

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
      // 自定义参数
      custom_params: JSON.stringify(orderInfo),
      // 商户订单号 (用你的订单ID)
      out_trade_no: orderId, // 商户订单号 (用你的订单ID)
      total_amount: parseFloat(amount).toFixed(2), // 金额
      subject: subject || "ChainPay订单", // 订单标题
      product_code: "FAST_INSTANT_TRADE_PAY", // 产品码
      // 商品详情
      goods_detail: [
        {
          goods_id: "123456", // 商品ID
          goods_name: "测试商品", // 商品名称
          quantity: 1, // 商品数量
          price: parseFloat(amount).toFixed(2), // 商品单价
          show_url: `https://res.cloudinary.com/dlji1nmdj/image/upload/c_fill,w_280,h_280,g_auto/f_auto/q_80/v1763887762/${goodsImage}?_a=BBDAAEAE0`, // 商品展示URL
        },
      ],
      timeout_express: "30m", // 超时时间
    };
    // 5️⃣ 生成支付表单 HTML
    // pageExecute 会返回一段 HTML 代码，前端执行后会自动跳转支付宝
    const formHtml = alipaySdk.pageExecute(
      "alipay.trade.page.pay",
      "POST", // 推荐用 POST，兼容性更好
      {
        bizContent,
        returnUrl: `${process.env.ALIPAY_RETURN_URL}?orderId=${orderId}`, // 支付成功后跳转的URL
        notifyUrl: process.env.ALIPAY_NOTIFY_URL, // 支付通知URL
      },
    );

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

/**
 * 根据主订单号查询订单
 * @param orderId 主订单号
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
/**
 * 根据子订单号查询订单
 * @param orderId 子订单号
 * @returns 订单信息
 */
async function getOrderBySlaveOrderId(orderId: string) {
  const order =
    await sql`select slave_order_no, payment_status, order_status, total_amount from order_shops where slave_order_no = ${orderId}`;
  console.log("子订单号查询", order);
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

async function updateOrderAddressBySlaveOrderId(
  orderId: string,
  addressId: number,
) {
  await sql`UPDATE order_shops SET address_id = ${addressId} WHERE slave_order_no = ${orderId}`;
}
async function updateOrderAddressByMasterOrderId(
  orderId: string,
  addressId: number,
) {
  await sql`UPDATE order_shops SET address_id = ${addressId} WHERE master_order_no = ${orderId}`;
}
