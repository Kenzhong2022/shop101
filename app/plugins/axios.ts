/**
 * Axios 插件配置
 *
 * 功能：为整个 Nuxt 应用提供统一配置的 Axios 实例
 * 定位：作为全局 HTTP 请求工具，替代原生 axios
 *
 * 核心特性：
 * 1. 统一的基础路径和超时配置
 * 2. 自动添加 Authorization 令牌（客户端环境）
 * 3. 记录请求时间戳和日志
 * 4. 响应结果统一处理和错误拦截
 * 5. HTTP 状态码智能提示（401/403/404/500等）
 * 6. 业务逻辑错误自动识别（基于 success: false 字段）
 * 7. 客户端友好的错误提示（使用 Element Plus ElMessage）
 *
 * 使用方式：
 * 在组件或 API 文件中通过 useNuxtApp().$axios 获取配置好的实例
 *
 * 示例：
 * const { $axios } = useNuxtApp()
 * const response = await $axios.get('/user/profile')
 */

import axios, { AxiosError } from "axios";
import type { ApiErrorData } from "~/types/api-error";
import { ERROR_MAP } from "~/types/api-error";

/**
 * 处理未授权错误（401）
 */
function handleUnauthorized(message?: string) {
  const route = useRoute();
  const redirect = encodeURIComponent(route.fullPath);

  ElMessage.error(message || ERROR_MAP[401]);
  navigateTo(`/login/myLogin?redirect=${redirect}`);
}

/**
 * 显示错误消息（仅客户端）
 */
function showError(message: string) {
  if (process.client) ElMessage.error(message);
}

export default defineNuxtPlugin((nuxtApp) => {
  // 创建axios实例
  const axiosInstance = axios.create({
    baseURL: "/api", // 基础路径
    timeout: 30000, // 30秒超时
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      // 从cookie中获取token
      if (process.client) {
        const token = useCookie("auth-token").value;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log("[Axios] 请求拦截器 - 未找到token");
        }
      }

      // 添加请求时间戳
      config.headers["X-Request-Time"] = new Date().toISOString();

      return config;
    },
    (error) => {
      console.error("[Axios] 请求拦截器错误:", error);
      return Promise.reject(error);
    },
  );

  // 响应拦截器：统一错误处理
  axiosInstance.interceptors.response.use(
    (response) => {
      // console.log(
      //   `[Axios] 响应拦截器 - ${response.config.method?.toUpperCase()} ${
      //     response.config.url
      //   } - 状态码: ${response.status}`
      // );

      // 检查业务逻辑错误
      if (response.data && response.data.success === false) {
        const message = response.data.message || "业务处理失败";
        console.error(`[Axios] 响应拦截器 - 业务错误: ${message}`);

        // 显示错误消息
        if (process.client) {
          ElMessage.error(message);
        }

        return Promise.reject(new Error(`业务处理失败: ${message}`));
      }

      return response;
    },
    // 错误处理：统一封装
    (error: AxiosError<ApiErrorData>) => {
      console.error("[Axios] 响应错误:", error);

      // 分支1: 服务器返回错误响应
      if (error.response) {
        const httpStatus = error.response.status;
        const { message, statusCode } = error.response.data || {};

        // 优先使用业务状态码，其次 HTTP 状态码
        const code = statusCode || httpStatus;
        const msg = message || ERROR_MAP[code] || `请求失败: ${code}`;

        console.error(`[Axios] ${code}: ${msg}`);

        // 统一错误处理
        switch (code) {
          case 401:
            handleUnauthorized(message); // ✅ 使用提取的函数
            break;
          case 403:
            showError(msg);
            break;
          case 404:
            showError(msg);
            break;
          case 500:
            showError(msg);
            break;
          default:
            showError(msg);
        }
      }
      // 分支2: 网络错误（无响应）
      else if (error.request) {
        console.error("[Axios] 网络错误:", error.message);
        showError("网络连接失败，请检查网络设置");
      }
      // 分支3: 配置/代码错误
      else {
        console.error("[Axios] 配置错误:", error.message);
        showError("请求配置错误");
      }

      return Promise.reject(error);
    },
  );

  // 将axios实例添加到Nuxt应用中 ， 可以在任何组件中通过useNuxtApp().$axios 访问
  nuxtApp.provide("axios", axiosInstance);

  console.log("[Axios Plugin] Axios插件初始化完成");
});
