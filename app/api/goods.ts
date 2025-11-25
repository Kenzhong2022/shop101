// 商品相关接口
//导入数据结构
import type { ListRequest, ListResponse } from "~~/server/api/goods/list.post";
// 1. 导入请求工具
import { useNuxtApp } from "#app";
// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义商品列表接口函数
export async function apiGoodsList(params: ListRequest): Promise<ListResponse> {
  return getAxios()
    .post<ListResponse>("/goods/list", params)
    .then((res) => res.data);
}
