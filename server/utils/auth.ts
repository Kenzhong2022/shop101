/**
 * 文件路径: /d:/shop101/server/utils/auth.ts
 * 功能: 认证工具函数 - 提供Token验证和签名验证功能
 * 主要功能: 验证用户登录令牌的格式、过期时间和签名有效性
 * 提供HMAC签名生成和验证功能
 */

import crypto from "node:crypto";
const SECRET = process.env.HMAC_SECRET_KEY || "abc123"; // 从环境变量获取密钥，默认值为 "abc123"

// 检查 token 是否有效
export function checkToken(token: string): number {
  // token 格式：uid.exp.sig （uid 为用户 id，exp 为过期时间戳，sig 为签名）
  const [uid, exp, sig] = token.split(".");
  if (!uid || !exp || !sig) throw new Error("格式不对");

  if (Date.now() > Number(exp)) throw new Error("已过期");

  // 验证签名
  const expect = crypto
    .createHmac("sha256", SECRET) // 创建 HMAC 实例，使用 SHA-256 算法和密钥 SECRET
    .update(`${uid}.${exp}`) // 更新 HMAC 实例，添加 uid 和 exp 字符串
    .digest("hex"); // 计算签名并转换为十六进制字符串

  if (sig !== expect) throw new Error("签名错");

  return Number(uid); // 返回用户 id
}

/**
 * 生成HMAC签名
 * @param info 要签名的信息
 * @param key 签名密钥
 * @returns HMAC签名结果
 */
export function generateSignature(info: string, key: string): string {
  return crypto.createHmac("sha256", key).update(info).digest("hex");
}

/**
 * 验证HMAC签名
 * @param info 原始信息
 * @param key 签名密钥
 * @param providedSignature 提供的签名
 * @returns 签名是否有效
 */
export function verifySignature(
  info: string, // 信息
  key: string, // 签名密钥
  providedSignature: string // 提供的签名
): boolean {
  // 1. 生成预期签名
  const expectedSignature = generateSignature(info, key);
  // 使用crypto.timingSafeEqual防止时序攻击
  const expectedBuffer = Buffer.from(expectedSignature, "hex"); // 预期签名转换为Buffer
  const providedBuffer = Buffer.from(providedSignature, "hex"); // 提供的签名转换为Buffer

  // 2. 对比签名是否相等
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer); // 对比签名是否相等
}

/**
 * 生成登录令牌
 * @param uid 用户ID
 * @param exp 过期时间戳
 * @param secretKey 签名密钥
 * @returns 格式为 uid.exp.sig 的登录令牌
 */
export function generateLoginToken(
  uid: string,
  exp: string,
  secretKey: string
): string {
  const sig = generateSignature(`${uid}.${exp}`, secretKey);
  return `${uid}.${exp}.${sig}`;
}
