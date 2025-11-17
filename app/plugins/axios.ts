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

import axios from "axios";

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
          console.log(
            `[Axios] 请求拦截器 - 添加Authorization头: Bearer ${token.substring(
              0,
              10
            )}...`
          );
        } else {
          console.log("[Axios] 请求拦截器 - 未找到token");
        }
      }

      // 添加请求时间戳
      config.headers["X-Request-Time"] = new Date().toISOString();

      console.log(
        `[Axios] 请求拦截器 - ${config.method?.toUpperCase()} ${config.url}`
      );
      return config;
    },
    (error) => {
      console.error("[Axios] 请求拦截器错误:", error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(
        `[Axios] 响应拦截器 - ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - 状态码: ${response.status}`
      );

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
    (error) => {
      console.error("[Axios] 响应拦截器错误:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            const message = data?.message || "登录已过期，请重新登录";
            console.error(`[Axios] 响应拦截器 - 401未授权: ${message}`);

            if (process.client) {
              ElMessage.error(message);
              console.log(
                "当前页面URL【编码】:",
                location.href,
                encodeURIComponent(location.href)
              );
              console.log(
                "当前页面URL【解码】:",
                location.href,
                decodeURIComponent(encodeURIComponent(location.href))
              );
              // 跳转到登录页并携带当前页面URL作为重定向参数
              navigateTo(
                "/login/myLogin?redirect=" + encodeURIComponent(location.href)
              );
            }
            break;

          case 403:
            console.error("[Axios] 响应拦截器 - 403 forbidden");
            if (process.client) {
              ElMessage.error("没有权限访问该资源");
            }
            break;

          case 404:
            console.error("[Axios] 响应拦截器 - 404 not found");
            if (process.client) {
              ElMessage.error("请求的资源不存在");
            }
            break;

          case 500:
            const serverMessage = data?.message || "服务器内部错误，请稍后重试";
            console.error(
              `[Axios] 响应拦截器 - 500服务器错误: ${serverMessage}`
            );

            if (process.client) {
              ElMessage.error(serverMessage);
            }
            break;

          default:
            const defaultMessage = data?.message || `请求失败: ${status}`;
            console.error(
              `[Axios] 响应拦截器 - ${status}错误: ${defaultMessage}`
            );

            if (process.client) {
              ElMessage.error(defaultMessage);
            }
        }
      } else if (error.request) {
        console.error("[Axios] 响应拦截器 - 网络错误:", error.message);
        if (process.client) {
          ElMessage.error("网络连接失败，请检查网络设置");
        }
      } else {
        console.error("[Axios] 响应拦截器 - 请求配置错误:", error.message);
        if (process.client) {
          ElMessage.error("请求配置错误");
        }
      }

      return Promise.reject(error);
    }
  );

  // 将axios实例添加到Nuxt应用中 ， 可以在任何组件中通过useNuxtApp().$axios 访问
  nuxtApp.provide("axios", axiosInstance);

  console.log("[Axios Plugin] Axios插件初始化完成");
});
