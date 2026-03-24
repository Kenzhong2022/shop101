/**
 * 购物车相关类型定义
 * @description 此文件只包含类型定义和常量，不包含服务器端代码
 * 可供前端和后端共享使用
 */

// ==================== 购物车添加相关类型 ====================

/** 添加到购物车请求参数 */
export interface CartAddRequest {
  goods_id: number; // 商品ID
  quantity?: number; // 数量（可选，默认1）
  sku_code: string; // 规格 RED-S-COT
  sku_value: string; // 规格值
}

/** 添加到购物车响应数据 */
export interface CartAddResponseData {
  cart_id: number; // 购物车项ID
  total_quantity: number; // 购物车总数量
  added_quantity: number; // 添加的数量
}

/** 添加到购物车响应结构 */
export interface CartAddResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: CartAddResponseData;
}
