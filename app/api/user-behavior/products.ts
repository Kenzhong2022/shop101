/**
 * 用户行为商品 增删改查接口
 * @description 用于管理用户商品行为数据（点击、收藏、加购、购买等）
 */
import type {
  userBehaviorProductsListRequest,
  userBehaviorProductsListResponse,
  userBehaviorProductsDeleteRequest,
  userBehaviorProductsDeleteResponse,
  userBehaviorProductsGetRequest,
  userBehaviorProductsGetResponse,
} from "~~/server/types/user-behavior";

// 1. 导入请求工具
import { useNuxtApp } from "#app";
// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义用户行为商品列表接口函数
/**
 * 用户行为商品列表接口
 * @param params 请求参数
 * @param params.searchKey 搜索关键词（可选）
 * @param params.timeStart 时间开始（可选）
 * @param params.timeEnd 时间结束（可选）
 * @param params.page 页码（可选）
 * @param params.page_size 每页数量（可选）
 * @param params.action_type 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
 * @returns 用户行为商品列表响应数据
 */
export async function userBehaviorProductsList(
  params: userBehaviorProductsListRequest,
): Promise<userBehaviorProductsListResponse> {
  return getAxios()
    .post<userBehaviorProductsListResponse>("/history/products/list", params)
    .then((res) => res.data);
}

// 4. 定义用户行为商品删除接口函数
/**
 * 用户行为商品删除接口
 * @param params 请求参数
 * @param params.productIds 要删除的商品ID数组
 * @param params.action_type 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
 * @returns 用户行为商品删除响应数据
 */
export async function userBehaviorProductsDelete(
  params: userBehaviorProductsDeleteRequest,
): Promise<userBehaviorProductsDeleteResponse> {
  return getAxios()
    .post<userBehaviorProductsDeleteResponse>(
      "/history/products/delete",
      params,
    )
    .then((res) => res.data);
}

/**
 * 查询用户对商品的收藏记录
 * @param params 请求参数
 * @param params.productId 商品ID
 * @returns 收藏记录数据，如果未收藏则返回null
 */
export async function userBehaviorProductsGet(
  params: userBehaviorProductsGetRequest,
): Promise<userBehaviorProductsGetResponse> {
  return getAxios()
    .post<userBehaviorProductsGetResponse>("/history/products/get", params)
    .then((res) => res.data);
}
