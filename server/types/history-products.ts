/**
 * 浏览历史商品相关类型定义
 * @description 此文件只包含类型定义，不包含服务器端代码
 * 可供前端和后端共享使用
 */

import type { Goods } from "./goods";

// 请求参数 分页 时间区间 key值
export interface apihistoryProductsListRequest {
  searchKey?: string; // 搜索关键词（可选）
  timeStart?: number; // 时间开始（可选）
  timeEnd?: number; // 时间结束（可选）
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
  action_type: number; // 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
}

export interface apihistoryProductsListResponseData {
  total: number; // 总记录数
  GoodsItems: Goods[]; // 商品列表
}

// 响应数据 分页 时间区间 key值
export interface apihistoryProductsListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: apihistoryProductsListResponseData;
}

// 删除请求参数 - 商品ID数组
export interface apihistoryProductsDeleteRequest {
  productIds: number[]; // 要删除的商品ID数组
  action_type: number; // 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
}

// 删除响应数据
export interface apihistoryProductsDeleteResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: {
    deletedCount: number; // 删除的记录数量
  };
}
