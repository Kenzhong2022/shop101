/**
 * 登录接口（POST /api/auth/login2）- 数据库版本
 * 接收邮箱和密码，查询数据库验证用户身份，生成登录token
 *
 * 功能说明：
 * 1. 接收前端传来的邮箱和密码
 * 2. 查询数据库验证用户是否存在
 * 3. 生成登录token（使用HMAC签名）
 * 4. 返回登录结果和token
 */

// 登录请求数据格式
interface LoginRequest {
  email: string; // 用户邮箱
  password: string; // 用户密码
}

// 登录响应数据格式
interface LoginResponse {
  success: boolean; // 登录是否成功
  message: string; // 提示信息
  data?: {
    token: string; // 登录令牌
    user: {
      id: number; // 用户ID
      email: string; // 用户邮箱
      username: string; // 用户名
    };
  };
  error?: {
    code: number; // 错误码
    message: string; // 错误信息
  };
}

// 导入数据库连接池
// import db from "../utils/db";
// 导入认证工具函数
import { generateLoginToken, checkToken } from "../utils/auth";

// server/api/users.get.ts
import getNeon from "../utils/neon";

// 执行SQL查询 - 查找匹配邮箱和密码的用户
// 1. Neon 查询：用模板字符串写法
const mySql = getNeon();
// 导入密码加密函数
// import md5 from "js-md5";
// 导入bcrypt密码加密库
import bcrypt from "bcrypt";
/**
 * 处理登录请求的主函数
 * 查询数据库验证用户身份，支持token验证和邮箱密码登录
 *
 * 工作流程：
 * 1. 如果请求中包含token，先尝试验证token
 * 2. 如果token验证成功，直接返回用户信息
 * 3. 如果token验证失败或没有token，进行邮箱密码登录验证
 * 4. 登录成功时生成新的token并返回
 */
export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    console.log("👉【服务器】/api/auth/login2 数据库版本被访问了");

    // 第一步：获取前端传来的登录数据
    const body = await readBody<LoginRequest & { token?: string }>(event);
    const { email, password, token } = body;

    // 如果有token，尝试解密验证
    if (token) {
      try {
        console.log("🔍【Token验证】尝试解密token:", token);
        const uid = checkToken(token);
        console.log("✅【Token验证】成功，用户ID:", uid);

        // 查询数据库获取用户信息
        const [userRows] =
          await mySql`SELECT id, email, username FROM user WHERE id = ${uid} LIMIT 1`;
        if (Array.isArray(userRows) && userRows.length > 0) {
          const user = userRows[0] as any;

          // 如果token有效且用户存在，返回完整用户信息
          return {
            success: true,
            message: "Token验证成功，用户已登录",
            data: {
              token: token, // 返回原token
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
              },
            },
          } as LoginResponse;
        } else {
          console.log("❌【Token验证】用户不存在，ID:", uid);
        }
      } catch (tokenError: any) {
        console.log("❌【Token验证】失败:", tokenError.message);
        // token验证失败，继续正常登录流程
      }
    }

    // 第二步：参数验证
    if (!email || !password) {
      return {
        success: false,
        message: "邮箱和密码不能为空",
        error: {
          code: 400,
          message: "缺少必填参数",
        },
      } as LoginResponse;
    }

    // 第三步：查询数据库验证用户
    console.log("🔍【数据库】查询用户电邮:", email);
    console.log("🔍【数据库】查询密码:【未加密】", password);
    // bcrypt加密明文密码
    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    console.log("🔍【数据库】查询密码:【加密】", hashedPwd);

    try {
      const [rows] = await mySql`
        SELECT id, email, username, password FROM "users" WHERE email = ${email} LIMIT 1
      `;

      console.log("📊【数据库】查询结果:", rows);

      // 检查是否找到用户
      if (typeof rows === "object") {
        const user = rows as any;
        console.log("🔍【数据库】查询密码:【数据库】", user.password);
        // 对比密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
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

        // 生成登录token（30分钟有效期）
        const exp = String(Date.now() + 30 * 60 * 1000); // 30分钟后的时间戳
        const hmacSecretKey = process.env.HMAC_SECRET_KEY || "abc123"; // 获取HMAC密钥
        console.log("🔑【HMAC密钥】:", hmacSecretKey);
        const token = generateLoginToken(Number(user.id), exp, hmacSecretKey);
        console.log("🔐【生成Token】:", token);

        // 返回成功响应
        return {
          success: true,
          message: "登录成功",
          data: {
            token: token, // 登录令牌
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            },
          },
        };
      } else {
        // 返回失败响应
        return {
          success: false,
          message: "邮箱或密码错误",
          error: {
            code: 401,
            message: "用户认证失败",
          },
        };
      }
    } catch (dbError: any) {
      console.error("❌【数据库错误】:", dbError.message);

      // 数据库查询错误
      return {
        success: false,
        message: "数据库查询失败",
        error: {
          code: 500,
          message: "服务器内部错误",
        },
      };
    }
  } catch (error: any) {
    console.error("❌【服务器错误】:", error.message);

    // 其他未预料的错误
    return {
      success: false,
      message: "服务器处理失败",
      error: {
        code: 500,
        message: "服务器内部错误",
      },
    } as LoginResponse;
  }
});
