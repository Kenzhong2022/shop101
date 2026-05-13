/**
 * 后端全局认证中间件
 * 功能：对所有非白名单接口进行 JWT 认证验证
 *
 * 使用方式：
 * 1. 白名单内的接口直接放行
 * 2. 其他接口需要携带有效的 JWT token（通过 Cookie: auth-token 传递）
 * 3. 认证成功后将用户信息挂载到 event.context.user
 */

import { defineEventHandler, createError } from "h3";
import { requireAuth, type JWTPayload } from "../utils/auth";

// 白名单路径（无需认证的公开接口）
const whiteList = [
  //首页相关
  "/",
  "/api/login2", // 登录
  "/api/register", // 注册
  "/api/sendCode", // 发送验证码
  "/api/goods/list", // 商品列表
  "/api/goods/sku", // 商品 SKU
  "/api/goods/", // 商品详情（包含 /api/goods/[id]/reviews 等）
  "/goods/", // 前端商品页面（包含 /goods/[id]/detail 等）
  "/api/category/tree", // 分类树
  "/api/compute-item-sim", // 商品相似度计算
  "/api/payment/alipay/notify", // 支付宝回调
  "/socket.io/", // WebSocket 连接
];

/**
 * 检查路径是否在白名单中
 */
function isInWhiteList(path: string): boolean {
  for (const pattern of whiteList) {
    let matched = false;
    // 特殊处理根路径 "/"，只匹配根路径本身
    if (pattern === "/") {
      matched = path === "/";
    } else if (pattern.endsWith("/")) {
      matched = path.startsWith(pattern);
    } else {
      matched = path === pattern || path.startsWith(pattern + "/");
    }
    if (matched) {
      console.log(`[白名单匹配] 路径: ${path} 匹配模式: ${pattern}`);
      return true;
    }
  }
  return false;
}

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || "";
  const method = event.node.req.method || "";

  console.log(`[全局中间件] 收到请求: ${method} ${path}`);
  console.log(`[全局中间件] 路径长度: ${path.length}`);
  console.log(`[全局中间件] 路径原始值: "${path}"`);

  // OPTIONS 请求直接放行（CORS 预检请求）
  if (event.node.req.method === "OPTIONS") {
    console.log(`[全局中间件] OPTIONS请求，直接放行: ${path}`);
    return;
  }

  // 检查是否在白名单中
  const inWhiteList = isInWhiteList(path);
  console.log(`[全局中间件] 是否在白名单: ${inWhiteList}`);
  if (inWhiteList) {
    console.log(`[全局中间件] 白名单路径，直接放行: ${path}`);
    return;
  }

  // 非白名单接口需要认证
  try {
    console.log(`[全局中间件] 非白名单路径，开始认证: ${path}`);
    const { userId, payload } = await requireAuth(event);

    // 将用户信息挂载到 event.context
    event.context.user = {
      userId,
      payload,
    };

    console.log(`[全局中间件] 认证成功，用户ID: ${userId}`);
  } catch (error: any) {
    console.error(`[全局中间件] 认证失败: ${path}`, error.message);

    throw createError({
      statusCode: 401,
      message: error.message || "未授权访问",
    });
  }
});
