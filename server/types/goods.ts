/**
 * 商品相关类型定义
 * @description 此文件只包含类型定义和常量，不包含服务器端代码
 * 可供前端和后端共享使用
 */

/** 商品列表请求参数 */
export interface ListRequest {
  shop_name?: string; // 店铺名称
  category_id?: number; // 分类ID
  page: number; // 页码
  page_size: number; // 每页数量
}

/** 商品信息 */
export interface Goods {
  id: number; // 商品ID
  goods_name: string; // 商品名称 (对应数据库字段)
  image: string; // 商品图片
  price: number; // 商品价格
  stock: number; // 商品库存
  sort: number; // 排序字段
  is_show: number; // 是否显示 (1:显示, 0:隐藏)
  sales?: number; // 商品销售量 (可选，可能是计算字段)
  created_at: string; // 创建时间 (对应数据库字段)
  updated_at: string; // 更新时间 (对应数据库字段)
  shop_name: string; // 店铺名称
  category_id?: number; // 分类ID
  [key: string]: any; // 后续追加字段
}

/** 商品列表响应 */
export interface ListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: {
    total: number; // 总数量
    list: Goods[]; // 商品列表
  };
}
