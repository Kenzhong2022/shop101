// 收藏历史 增删改查接口
import type {
  apihistoryProductsListRequest,
  apihistoryProductsListResponse,
  apihistoryProductsDeleteRequest,
  apihistoryProductsDeleteResponse,
} from "~~/server/types/history-products";

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
 * @param params 请求参数
 * @param params.searchKey 搜索关键词（可选）
 * @param params.timeStart 时间开始（可选）
 * @param params.timeEnd 时间结束（可选）
 * @param params.page 页码（可选）
 * @param params.page_size 每页数量（可选）
 * @param params.action_type 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
 * @returns 收藏历史商品列表响应数据
 */
export async function apihistoryProductsList(
  params: apihistoryProductsListRequest,
): Promise<apihistoryProductsListResponse> {
  return getAxios()
    .post<apihistoryProductsListResponse>("/history/products/list", params)
    .then((res) => res.data);
}

// 4. 定义收藏历史商品删除接口函数
/**
 * 收藏历史商品删除接口
 * @param
 * @returns 收藏历史商品删除响应数据
 */
export async function apihistoryProductsDelete(
  params: apihistoryProductsDeleteRequest,
): Promise<apihistoryProductsDeleteResponse> {
  return getAxios()
    .post<apihistoryProductsDeleteResponse>("/history/products/delete", params)
    .then((res) => res.data);
}
