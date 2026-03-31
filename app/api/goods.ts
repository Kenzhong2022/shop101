// 商品相关接口
//导入数据结构
import type { ListRequest, ListResponse } from "~~/server/types/goods";
import type { GoodsSpecData, ApiResponse } from "~~/server/types/goods-specs";
// 1. 导入请求工具
import { useNuxtApp } from "#app";
// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

/**
 * 获取商品列表
 * @param data 列表请求参数
 * @returns 商品列表响应
 */
export async function apiGoodsList(data: ListRequest): Promise<ListResponse> {
  return getAxios()
    .post("/goods/list", data)
    .then((res) => res.data);
}

/**
 * 获取商品规格
 * @param id 商品ID
 * @returns 商品规格数据
 */
export async function apiGoodsSpecs(
  id: number,
): Promise<ApiResponse<GoodsSpecData>> {
  return getAxios()
    .get(`/goods/${id}/specs`)
    .then((res) => res.data);
}
