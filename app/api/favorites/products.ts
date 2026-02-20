// 收藏历史 增删改查接口
import type {
  apiFavoritesProductsListRequest,
  apiFavoritesProductsListResponse,
} from "~~/server/api/favorites/products/list.post";

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
export async function apiFavoritesProductsList(
  params: apiFavoritesProductsListRequest,
): Promise<apiFavoritesProductsListResponse> {
  return getAxios()
    .post<apiFavoritesProductsListResponse>("/favorites/products/list", params)
    .then((res) => res.data);
}
