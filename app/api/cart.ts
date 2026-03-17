// 购物车相关接口
// 导入数据结构 - TODO: 根据实际后端接口定义导入具体类型
// import type { CartListRequest, CartListResponse } from "~~/server/api/carts/list.post";
import type {
  CartAddRequest,
  CartAddResponse,
} from "~~/server/api/cart/add.post";
// import type { CartUpdateRequest, CartUpdateResponse } from "~~/server/api/carts/update.post";
// import type { CartDeleteRequest, CartDeleteResponse } from "~~/server/api/carts/delete.post";

// 1. 导入请求工具
import { useNuxtApp } from "#app";

// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义购物车相关接口函数

/**
 * 获取购物车列表
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function getCartListApi(params: any): Promise<any> {
  return getAxios()
    .post<any>("/cart/list", params)
    .then((res) => res.data);
}

/**
 * 添加商品到购物车
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function addCartApi(
  params: CartAddRequest,
): Promise<CartAddResponse> {
  return getAxios()
    .post<any>("/cart/add", params)
    .then((res) => res.data);
}

/**
 * 更新购物车商品数量
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function updateCartApi(params: any): Promise<any> {
  return getAxios()
    .post<any>("/cart/update", params)
    .then((res) => res.data);
}

/**
 * 从购物车删除商品
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function removeCartApi(ids: number[]): Promise<any> {
  return getAxios()
    .post<any>("/cart/remove", { cart_ids: ids })
    .then((res) => res.data);
}

/**
 * 清空购物车
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function clearCartApi(params: any): Promise<any> {
  return getAxios()
    .post<any>("/cart/clear", params)
    .then((res) => res.data);
}

/**
 * 结算购物车
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function checkoutCartApi(params: any): Promise<any> {
  return getAxios()
    .post<any>("/cart/checkout", params)
    .then((res) => res.data);
}

/**
 * 获取购物车商品数量
 * TODO: 替换为实际的请求参数和响应类型
 */
export async function getCartCountApi(params: any): Promise<any> {
  return getAxios()
    .get<any>("/cart/count", { params })
    .then((res) => res.data);
}
