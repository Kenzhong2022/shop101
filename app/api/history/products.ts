// 收藏历史 增删改查接口
import type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
} from "~~/server/api/history/products/list.post";
import type {
  apihistoryProductsDeleteRequest,
  apihistoryProductsDeleteResponse,
} from "~~/server/api/history/products/delete.post";

// 1. 导入请求工具
import { useNuxtApp } from "#app";
// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义收藏历史商品列表接口函数
/**
 * 收藏历史商品列表接口
 * @param
 * @returns 收藏历史商品列表响应数据
 */
export async function apihistoryProductsList(
  params: apihistoryProductsListRequest,
): Promise<apihistoryProductsListResponse> {
  return getAxios()
    .post<apihistoryProductsListResponse>("/history/products/list", params)
    .then((res) => res.data);
}

/**
 * 删除历史记录商品接口
 * @param params 删除请求参数（商品ID数组）
 * @returns 删除操作响应数据
 */
export async function apihistoryProductsDelete(
  params: apihistoryProductsDeleteRequest,
): Promise<apihistoryProductsDeleteResponse> {
  return getAxios()
    .post<apihistoryProductsDeleteResponse>("/history/products/delete", params)
    .then((res) => res.data);
}
