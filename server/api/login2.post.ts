/**
 * 登录接口（POST /api/auth/login2）- JWT版本
 * 接收邮箱和密码，查询数据库验证用户身份，生成标准JWT
 */

import { readBody, setCookie } from "h3";
import getNeon from "../utils/neon";
import { generateJWT, verifyPassword, type SafeUser } from "../utils/auth";

interface LoginRequest {
  email: string;
  password: string;
  token?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: SafeUser;
    expiresIn: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

const mySql = getNeon();

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    console.log("👉【服务器】/api/auth/login2 JWT版本被访问了");

    const body = await readBody<LoginRequest>(event);
    const { email, password, token } = body;

    // 如果有token，验证是否有效
    if (token) {
      try {
        console.log("🔍【Token验证】尝试验证token:", token);
        const { checkToken } = await import("../utils/auth");
        const uid = checkToken(token);
        console.log("✅【Token验证】成功，用户ID:", uid);

        const [userRows] =
          await mySql`SELECT id, email, username, avatar FROM "users" WHERE id = ${uid} LIMIT 1`;
        console.log("📊【数据库】查询结果123:", userRows);
        if (userRows && userRows.id) {
          const user = userRows as any;
          setCookie(event, "auth-token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60, // 30分钟
            path: "/",
          });
          return {
            success: true,
            message: "Token验证成功，用户已登录",
            data: {
              token: token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
              },
            },
            expiresIn: 60,
          } as unknown as LoginResponse;
        }
      } catch (tokenError: any) {
        console.log("❌【Token验证】失败:", tokenError.message);
      }
    }

    // 参数验证
    if (!email || !password) {
      return {
        success: false,
        message: "邮箱和密码不能为空",
        error: {
          code: 400,
          message: "缺少必填参数",
        },
      };
    }

    // 查询用户
    console.log("🔍【数据库】查询用户电邮:", email);
    const [rows] = await mySql`
      SELECT id, email, username, password, avatar FROM "users" WHERE email = ${email} LIMIT 1
    `;

    console.log("📊【数据库】查询结果:", rows);

    if (!rows || !rows.id) {
      return {
        success: false,
        message: "用户不存在",
        error: {
          code: 404,
          message: "用户不存在",
        },
      };
    }

    const user = rows as any;
    console.log("🔍【数据库】数据库密码:【加密】", user.password);

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "邮箱或密码错误",
        error: {
          code: 401,
          message: "用户认证失败",
        },
      };
    }

    console.log("✅【登录成功】用户:", user.username);

    // 生成标准JWT（过期时间1分钟）为什么重新生成一个token
    const newToken = generateJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    console.log("🔐【生成JWT】:", newToken);

    // 将token设置到Cookie中
    setCookie(event, "auth-token", newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60, // 30分钟
      path: "/",
    });

    // 返回成功响应
    return {
      success: true,
      message: "登录成功",
      data: {
        token: newToken as string,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
        expiresIn: 60, // 60秒
      },
    };
  } catch (error: any) {
    console.error("❌【服务器错误】:", error.message);

    return {
      success: false,
      message: "服务器处理失败",
      error: {
        code: 500,
        message: "服务器内部错误",
      },
    };
  }
});
