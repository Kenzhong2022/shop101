/**
 * 用户行为商品相关类型定义
 * @description 此文件只包含类型定义，不包含服务器端代码
 * 可供前端和后端共享使用
 */

import type { Goods } from "./goods";

// 请求参数 - 分页、时间区间、搜索关键词、行为类型
export interface userBehaviorProductsListRequest {
  searchKey?: string; // 搜索关键词（可选）
  timeStart?: number; // 时间开始（可选）
  timeEnd?: number; // 时间结束（可选）
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
  action_type?: number; // 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
}

export interface userBehaviorProductsListResponseData {
  total: number; // 总记录数
  GoodsItems: Goods[]; // 商品列表
}

// 响应数据
export interface userBehaviorProductsListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: userBehaviorProductsListResponseData;
}

// 删除请求参数 - 商品ID数组和行为类型
export interface userBehaviorProductsDeleteRequest {
  productIds: number[]; // 要删除的商品ID数组
  action_type?: number; // 行为类型（可选）：1=点击, 2=收藏, 3=加购, 4=购买
}

// 删除响应数据
export interface userBehaviorProductsDeleteResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: {
    deletedCount: number; // 删除的记录数量
  };
}

// 查询收藏记录请求参数 - 商品ID
export interface userBehaviorProductsGetRequest {
  productId: number; // 商品ID
}

// 查询收藏记录响应数据
export interface userBehaviorProductsGetResponseData {
  id: number; // 用户行为记录ID
  item_id: number; // 商品ID
  goods_name: string; // 商品名称
  image: string; // 商品图片
  price: number; // 商品价格
  action_type: number; // 行为类型（固定为2=收藏）
  action_weight: number; // 行为权重
  action_time: string; // 行为时间
}

// 查询收藏记录响应
export interface userBehaviorProductsGetResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: userBehaviorProductsGetResponseData | null; // 收藏记录数据，找不到返回null
}
