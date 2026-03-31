// 1. 导入请求工具
import { useNuxtApp } from "#app";
import type {
  CreateOrderRequestDTO,
  OrderCreateResponse,
  OrderListRequestDTO,
  OrderListResponseDTO,
} from "~~/server/types/order";

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
): Promise<OrderCreateResponse> {
  return getAxios()
    .post<OrderCreateResponse>("/orders/create", params)
    .then((res) => res.data);
}

/**
 * @description 获取订单列表
 * @param params
 * @param params.page 页码（可选）
 * @param params.page_size 每页数量（可选）
 * @param params.itemStatus 订单状态（可选）
 * @returns 订单列表响应
 */
export async function getOrderListApi(
  params: OrderListRequestDTO,
): Promise<OrderListResponseDTO> {
  return getAxios()
    .post<OrderListResponseDTO>("/orders/list", params)
    .then((res) => res.data);
}
