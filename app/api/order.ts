// 1. 导入请求工具
import { useNuxtApp } from "#app";
import type {
  CreateOrderRequestDTO,
  CreateOrderResponseVO,
} from "~~/server/api/orders/create.post";
// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

/**
 * 创建订单
 */
export async function createOrderApi(
  params: CreateOrderRequestDTO,
): Promise<CreateOrderResponseVO> {
  return getAxios()
    .post<CreateOrderResponseVO>("/orders/create", params)
    .then((res) => res.data);
}
