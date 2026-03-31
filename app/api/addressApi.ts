import type {
  CreateAddressRequest,
  ApiResponse,
  AddressListResponse,
  UpdateAddressRequest,
} from "~~/server/types/user-address";

// 1. 导入请求工具
import { useNuxtApp } from "#app";

// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};
/**
 * 创建地址
 * @param {CreateAddressRequest} params 创建地址请求参数
 * @returns 创建地址响应
 */
export async function createAddressApi(
  params: CreateAddressRequest,
): Promise<ApiResponse<any>> {
  return getAxios()
    .post<ApiResponse<any>>("/user-address/create", params)
    .then((res) => res.data);
}

/**
 * 获取地址列表
 * @returns 获取地址列表响应
 */
export async function getAddressListApi(): Promise<AddressListResponse> {
  return getAxios()
    .post<ApiResponse<any>>("/user-address/list")
    .then((res) => res.data);
}

/**
 * 更新地址
 * @param {UpdateAddressRequest} params 更新地址请求参数
 * @returns 更新地址响应
 */
export async function updateAddressApi(
  params: UpdateAddressRequest,
): Promise<ApiResponse<any>> {
  return getAxios()
    .put<ApiResponse<any>>(`/user-address/${params.id}/update`, params)
    .then((res) => res.data);
}

/**
 * 删除地址
 * @param {number} id 地址ID
 * @returns 删除地址响应
 */
export async function deleteAddressApi(id: number): Promise<ApiResponse<any>> {
  return getAxios()
    .delete<ApiResponse<any>>(`/user-address/${id}/delete`)
    .then((res) => res.data);
}
