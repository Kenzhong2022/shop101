// types/api-error.ts
import type { AxiosError } from "axios";

// 后端返回的错误数据结构
export interface ApiErrorData {
  code?: string;
  message?: string;
  statusCode?: number;
  success?: boolean;
  details?: string;
  timestamp?: string;
}

// 扩展 AxiosError，保留原有属性 + 自定义数据
export type ApiError = AxiosError<ApiErrorData>;

// 错误映射表
export const ERROR_MAP: Record<number, string> = {
  401: "登录已过期，请重新登录",
  403: "没有权限访问该资源",
  404: "请求的资源不存在",
  500: "服务器内部错误，请稍后重试",
};
