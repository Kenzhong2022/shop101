/**
 * 认证相关 API 接口
 * 登录模块的 API 函数
 */

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      username: string;
    };
  };
}

/**
 * 注册相关 API 接口
 * @
 */
interface RegisterRequest {
  username: string;
  email: string;
  code: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

/**
 * 注册接口
 * @param params 注册参数（邮箱、验证码、密码）
 * @returns 注册响应
 */
export async function register(
  params: RegisterRequest
): Promise<RegisterResponse> {
  const { username, email, code, password } = params;
  // 调用注册接口server/api/register.ts
  return await $fetch<RegisterResponse>("/api/register", {
    method: "POST",
    body: {
      username,
      email,
      code,
      password,
    } as RegisterRequest,
  });
}

interface SendCodeRequest {
  email: string;
}

interface SendCodeResponse {
  success: boolean;
  message: string;
  code: string;
}

/**
 * 获得验证码接口
 * @param email 邮箱地址
 * @returns 验证码响应
 */
export async function sendCode(email: string): Promise<SendCodeResponse> {
  return await $fetch<SendCodeResponse>("/api/sendCode", {
    method: "POST",
    body: { email } as SendCodeRequest,
  });
}

/**
 * 用户登录接口
 * @param credentials 登录凭证
 * @returns 登录响应
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // 调用登录接口server/api/login2.ts
    const response = await $fetch<LoginResponse>("/api/login2", {
      method: "POST",
      body: credentials,
    });

    return response;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
}

/**
 * 用户登出接口
 */
export async function logout(): Promise<void> {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("登出失败:", error);
    throw error;
  }
}
