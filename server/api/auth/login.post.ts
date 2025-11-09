/**
 * 登录接口 - 服务器端处理
 *
 * 这个文件处理用户的登录请求
 * 当用户在前端点击"登录"按钮时，会调用这个接口
 *
 * 请求方式: POST
 * 请求地址: /api/auth/login
 *
 * 功能说明：
 * 1. 接收用户输入的邮箱和密码
 * 2. 验证用户信息是否正确
 * 3. 生成登录令牌(token)
 * 4. 返回登录结果给前端
 */

// 登录请求数据格式
interface LoginRequest {
  email: string; // 用户邮箱
  password: string; // 用户密码
  rememberMe?: boolean; // 是否记住我（可选）
}

// 登录响应数据格式
interface LoginResponse {
  success: boolean; // 登录是否成功
  message: string; // 提示信息
  data: {
    // 成功时的用户数据（可选）
    token: string; // 登录令牌，用于后续验证用户身份
    user: {
      id: number; // 用户ID
      email: string; // 用户邮箱
      username: string; // 用户名
    };
  };
  // 失败时的错误信息（可选）
  error?: {
    code: number; // 错误码
    message: string; // 错误信息
  };
}

// 模拟用户数据库（实际项目中应该连接真实数据库）
// 这里存放测试用的用户账号
const mockUsers = [
  {
    id: 18802075384,
    email: "test@example.com", // 测试账号
    password: "123456", // 测试密码
    username: "测试用户",
  },
  {
    id: 2,
    email: "admin@example.com", // 管理员账号
    password: "admin123", // 管理员密码
    username: "管理员",
  },
];

// Nitro错误对象接口定义
interface NitroError {
  statusCode: number;
  statusMessage: string;
  data?: any;
  cause?: any;
}

// 导入crypto模块（使用ES模块语法）
// crypto模块现在只在工具函数中使用，这里不再需要直接导入
// 导入认证工具函数
import { checkToken, generateSignature, verifySignature, generateLoginToken } from "../../utils/auth";
// 签名相关函数已抽离到 ../../utils/auth 中

/**
 * 处理登录请求的主函数
 * 这是Nitro服务器的API路由处理函数
 */
export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    console.log("👉【服务器】 /api/auth/login 被访问了"); // 先确认进了文件
    /**
     * 演示签名生成和验证 【学习案例】
     * 使用抽离到工具函数中的签名逻辑
     */
    const demoStr = "hello";
    const demoKey = "123456";
    const generatedSig = generateSignature(demoStr, demoKey);
    console.log("🔑【签名演示】原始信息:", demoStr);
    console.log("🔑【签名演示】密钥:", demoKey);
    console.log("🔑【签名演示】生成的签名:", generatedSig);

    // 拿原本的信息和密钥生成签名 对比提供的签名
    // 1.验证正确的签名
    const isValidCorrect = verifySignature(demoStr, demoKey, generatedSig);
    console.log("✅【签名验证】正确签名验证结果:", isValidCorrect);
    // 拿原本的信息和密钥生成签名 对比篡改后的签名tamperedSig
    // 2.验证篡改的签名
    const tamperedSig = "wrong_signature_12345";
    const isValidTampered = verifySignature(demoStr, demoKey, tamperedSig);
    console.log("❌【签名验证】篡改签名验证结果:", isValidTampered);

    // 验证篡改原始信息是否能验证通过
    const isValidTamperedInfo = verifySignature("hello", demoKey, tamperedSig);
    console.log("❌【签名验证】篡改原始信息验证结果:", isValidTamperedInfo);

    // 获取配置的HMAC密钥（演示从配置中读取）
    const configHmacKey = useRuntimeConfig().HMAC_SECRET_KEY;
    console.log("🔑【配置密钥】从runtimeConfig获取的HMAC密钥:", configHmacKey);
    // =================================【案例结束】
    // 第一步：获取前端传来的登录数据
    const body = await readBody<LoginRequest>(event);
    const { email, password } = body;
    // 第二步：检查必填字段（前端验证的补充）
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "邮箱和密码不能为空",
      });
    }

    // 第三步：验证用户信息是否正确
    // 在实际项目中，这里应该查询数据库
    const user = mockUsers.find(
      (item) => item.email === email && item.password === password
    );

    // 如果用户不存在或密码错误
    if (!user) {
      throw createError({
        statusCode: 401, // 401表示未授权
        statusMessage: "邮箱或密码错误",
      });
    }

    // 第四步：用户验证成功，生成带签名的登录令牌（格式：uid.exp.sig）
    // 生成符合 checkToken 格式的 token: uid.exp.sig
    const uid = user.id.toString();
    const exp = (Date.now() + 10 * 1000).toString(); // 1分钟后过期【用于测试】
    const hmacSecretKey = useRuntimeConfig().HMAC_SECRET_KEY;
    
    // 使用工具函数生成登录令牌
    const token = generateLoginToken(uid, exp, hmacSecretKey);

    console.log("🔑【登录令牌】使用配置的HMAC密钥:", hmacSecretKey);
    console.log("🔑【登录令牌】生成的令牌:", token);

    // 第五步：设置cookie（可选，用于自动登录）
    setCookie(event, "auth-token", token, {
      // httpOnly: true, // 防止XSS攻击
      httpOnly: false, // 先关掉，方便看
      secure: true, // 只在HTTPS下传输
      sameSite: "strict", // 防止CSRF攻击
      // maxAge: 60 * 60 * 24 * 7, // 有效期7天
      maxAge: 60 * 1000, // 有效期1分钟【用于测试】
    });

    // 第六步：返回成功响应给前端
    return {
      success: true,
      message: "登录成功",
      data: {
        token, // 前端可以用这个token做身份验证
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
    };
  } catch (error: any) {
    // 错误处理：如果已经是我们主动抛出的错误，直接返回
    // 检查错误对象是否有statusCode属性（这是Nitro的错误对象）
    const nitroError = error as NitroError;
    if (nitroError && typeof nitroError === "object" && nitroError.statusCode) {
      throw nitroError;
    }

    // 如果是未预料的错误，返回通用错误信息
    console.error("登录接口错误:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
