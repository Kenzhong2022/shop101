// 导入类型定义
import type { Category, CategoryTree } from "~~/server/types/category";

// 1. 导入请求工具
import { useNuxtApp } from "#app";

// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

/**
 * 获取分类树
 * @param params
 * @returns 分类树
 */
export async function getCategoryTreeApi(params: any): Promise<CategoryTree[]> {
  return getAxios()
    .post<CategoryTree[]>("/category/tree", params)
    .then((res) => res.data);
}
