/**
 * 行为操作接口
 */

// 1. 导入请求工具
import { useNuxtApp } from "#app";

// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义接口函数
export async function apiName(params: any): Promise<any> {
  const axios = getAxios();
  const response = await axios.post<any>(`/api/path`, params);
  return response.data;
}
