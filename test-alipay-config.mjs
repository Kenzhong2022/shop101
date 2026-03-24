import AlipayConfig from './config/alipay.mjs';

console.log("✅ 支付宝配置读取结果：");
console.log("appId:", AlipayConfig.appId);
console.log("notifyUrl:", AlipayConfig.notifyUrl);
console.log("returnUrl:", AlipayConfig.returnUrl);