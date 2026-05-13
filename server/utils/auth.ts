/**
 * 文件路径: /d:/shop101/server/utils/auth.ts
 * 功能: 认证工具函数 - 标准JWT实现
 * 主要功能: 生成、验证标准JSON Web Token
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { H3Event } from "h3";
import { getCookie, createError } from "h3";

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.HMAC_SECRET_KEY || "abc123";
const JWT_EXPIRES_IN = "30m"; // process.env.JWT_EXPIRES_IN || "1m";
const JWT_ISSUER = "shop101-api"; // 发布者
const JWT_AUDIENCE = "shop101-client"; // 接收者

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface SafeUser {
  id: number;
  email: string;
  username: string;
  avatar: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data?: {
    token: string;
    user: SafeUser;
    expiresIn: number;
  };
}
/**
 * 生成JWT
 * @param payload JWT payload，包含用户ID、邮箱、用户名
 * @returns 生成的JWT字符串
 */
export function generateJWT(
  payload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud">,
): string {
  /**
   * 生成JWT
   * @param payload JWT payload，包含用户ID、邮箱、用户名
   * @returns 生成的JWT字符串
   */
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}
/**
 * 验证JWT
 * @param token JWT字符串
 * @returns 验证通过的JWT payload或null
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error("[JWT验证失败]", error.message);
    console.error("[JWT验证失败类型]", error.name);
    if (error.name === "TokenExpiredError") {
      console.error("[JWT已过期]");
    } else if (error.name === "JsonWebTokenError") {
      console.error("[JWT签名不匹配]");
    }
    return null;
  }
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
/**
 * 获取JWT过期时间
 * @param token JWT字符串
 * @returns 过期时间（秒）
 */
export function getTokenTTL(token: string): number {
  /**
   * 获取JWT过期时间
   * @param token JWT字符串
   * @returns 过期时间（秒）
   */
  const decoded = decodeJWT(token);
  /**
   * 解码JWT
   * @param token JWT字符串
   * @returns 解码后的JWT payload或null
   */
  if (!decoded || !decoded.exp) return 0;
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
}
/**
 * 验证密码
 * @param plainPassword 明文密码
 * @param hashedPassword 哈希后的密码
 * @returns 验证结果
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function requireAuth(
  event: H3Event,
): Promise<{ userId: number; payload: JWTPayload }> {
  const token = getCookie(event, "auth-token");

  console.log("[requireAuth] 收到的token:", token);
  console.log("[requireAuth] JWT_SECRET长度:", JWT_SECRET?.length);
  console.log("[requireAuth] JWT_SECRET前5位:", JWT_SECRET?.substring(0, 5));

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "用户未登录",
    });
  }

  const payload = verifyJWT(token);
  console.log("[requireAuth] verifyJWT结果:", payload);

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: "Token无效或已过期",
    });
  }

  return {
    userId: payload.userId,
    payload,
  };
}

export function checkToken(
  token: string,
): number | { code: number; message: string } {
  const payload = verifyJWT(token);
  if (!payload) {
    throw { code: 401, message: "Token无效或已过期" };
  }
  return payload.userId;
}

export function generateLoginToken(
  uid: number,
  exp: string,
  secretKey: string,
): string {
  return generateJWT({
    userId: uid,
    email: "",
    username: "",
  });
}
/**
 * 生成签名
 * @param info 要签名的信息
 * @param secretKey 密钥
 * @returns 生成的签名
 */
export function generateSignature(info: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(info).digest("hex");
}

export function verifySignature(
  info: string,
  key: string,
  providedSignature: string,
): boolean {
  const expectedSignature = generateSignature(info, key);
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
