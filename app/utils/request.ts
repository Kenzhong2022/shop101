/**
 * 二次封装的HTTP请求工具
 * 基于$fetch的统一请求处理
 * 提供GET、POST、PUT、DELETE、PATCH等常用请求方法
 * 支持查询参数、请求体、自定义头、超时设置等
 */

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * 基础请求函数
 * @param url 请求URL
 * @param options 请求配置
 * @returns 响应数据
 */
async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    params,
    data,
    headers = {},
    timeout = 30000,
  } = options;

  try {
    // 构建完整的请求配置
    const requestConfig: any = {
      method,
      timeout,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // 处理GET请求的查询参数
    let fullUrl = url;
    if (method === "GET" && params) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl = queryString ? `${url}?${queryString}` : url;
    }

    // 处理非GET请求的请求体
    if (method !== "GET" && data) {
      requestConfig.body = JSON.stringify(data);
    }

    // 发送请求
    const response = await $fetch<T>(fullUrl, requestConfig);

    // 统一的响应数据检查
    // 检查是否有success字段且为false
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success === false
    ) {
      console.error(`[Request] 业务错误 - ${method} ${url}:`, response);

      // 弹出message提示，优先使用response.message
      const message = (response as any).message || "业务处理失败";
      try {
        // 使用Element Plus的ElMessage
        if (process.client) {
          // 客户端环境下使用ElMessage
          const { ElMessage } = await import("element-plus");
          ElMessage.error(message);
        } else {
          // 服务端环境下记录日志
          console.warn("[Request] 服务端环境无法显示ElMessage:", message);
        }
      } catch (e) {
        // 如果ElMessage不可用，记录日志但不中断流程
        console.warn("[Request] 无法弹出ElMessage提示:", e);
      }

      throw new Error(`业务处理失败: ${message}`);
    }

    // 检查是否有code字段且为401或500
    if (response && typeof response === "object" && "code" in response) {
      const code = (response as any).code;
      const message = (response as any).message || "";

      if (code === 401) {
        console.error(`[Request] 未授权访问 - ${method} ${url}:`, response);

        // 弹出未授权提示
        const errorMsg = message || "登录已过期，请重新登录";
        try {
          // 使用Element Plus的ElMessage
          if (process.client) {
            const { ElMessage } = await import("element-plus");
            ElMessage.error(errorMsg);
          } else {
            console.warn("[Request] 服务端环境无法显示ElMessage:", errorMsg);
          }
        } catch (e) {
          console.warn("[Request] 无法弹出ElMessage提示:", e);
        }

        throw new Error(errorMsg);
      } else if (code === 500) {
        console.error(`[Request] 服务器错误 - ${method} ${url}:`, response);

        // 弹出服务器错误提示
        const errorMsg = message || "服务器内部错误，请稍后重试";
        try {
          // 使用Element Plus的ElMessage
          if (process.client) {
            const { ElMessage } = await import("element-plus");
            ElMessage.error(errorMsg);
          } else {
            console.warn("[Request] 服务端环境无法显示ElMessage:", errorMsg);
          }
        } catch (e) {
          console.warn("[Request] 无法弹出ElMessage提示:", e);
        }

        throw new Error(errorMsg);
      }
    }

    return response;
  } catch (error) {
    // 只在控制台抛出错误，不显示弹窗提示
    if (error instanceof Error) {
      // 如果是我们抛出的业务错误，直接抛出（已经包含消息提示）
      if (
        error.message.includes("业务处理失败") ||
        error.message.includes("登录已过期") ||
        error.message.includes("服务器内部错误")
      ) {
        throw error;
      }

      // 网络请求错误 - 只在控制台记录
      console.error(
        `[Request] 网络请求失败 - ${method} ${url}:`,
        error.message
      );
      throw new Error(`网络请求失败: ${error.message}`);
    } else {
      // 未知错误 - 只在控制台记录
      console.error(`[Request] 未知错误 - ${method} ${url}:`, error);
      throw new Error("请求失败，请检查网络连接");
    }
  }
}

/**
 * 封装的请求方法
 */
export const http = {
  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return request<T>(url, { method: "GET", params, headers });
  },

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return request<T>(url, { method: "POST", data, headers });
  },

  /**
   * PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return request<T>(url, { method: "PUT", data, headers });
  },

  /**
   * DELETE请求
   */
  async delete<T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return request<T>(url, { method: "DELETE", params, headers });
  },

  /**
   * PATCH请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return request<T>(url, { method: "PATCH", data, headers });
  },
};

export default http;
