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
 * 用户登录接口
 * @param credentials 登录凭证
 * @returns 登录响应
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials
    });
    
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 用户登出接口
 */
export async function logout(): Promise<void> {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    });
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}