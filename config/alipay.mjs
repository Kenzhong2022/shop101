import dotenv from 'dotenv';

dotenv.config();

const AlipayConfig = {
  // 应用ID（沙箱环境）
  appId: process.env.ALIPAY_APP_ID,

  // 应用私钥
  privateKey: process.env.ALIPAY_PRIVATE_KEY,

  // 支付宝公钥
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,

  // 支付宝网关（沙箱环境）
  gateway: "https://openapi-sandbox.dl.alipaydev.com/gateway.do",

  // 签名类型
  signType: "RSA2",

  // 字符集
  charset: "utf-8",

  // 版本号
  version: "1.0",

  // 异步通知地址
  notifyUrl:
    process.env.ALIPAY_NOTIFY_URL ||
    "http://your-domain.com/api/payment/alipay/notify",

  // 同步返回地址
  returnUrl:
    process.env.ALIPAY_RETURN_URL || "http://localhost:3000/payment/result",
};

export default AlipayConfig;