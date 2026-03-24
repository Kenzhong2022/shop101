/**
 * 商品规格相关类型定义
 * @description 此文件只包含类型定义和常量，不包含服务器端代码
 * 可供前端和后端共享使用
 */

/** 规格值（如：中国红、S码） */
export interface SpecValue {
  id: string;
  name: string; // 显示名：中国红
  code: string; // 代码：red
  sort_order: number; // 排序
}

/**
 * 规格维度（如：颜色、尺码）
 * name: 显示名
 * code: 字段名
 * values: 该维度下的所有可选值
 */
export interface SpecDimension {
  id: string;
  name: string; // 显示名：颜色
  code: string; // 字段名：color
  sort_order: number; // 维度顺序（0,1,2...）
  values: SpecValue[]; // 该维度下的所有可选值
}

/** SKU库存单元 */
export interface SkuInfo {
  sku_id: string;
  sku_code: string; // 商家编码：RED-S-COT
  specs_hash: string; // 规格组合：red|s|cotton
  specs: string[]; // 规格值数组：['red', 's', 'cotton']
  price: string; // 价格（字符串，保留两位小数）
  stock: number; // 库存数量
  is_available: boolean; // 是否有库存（stock > 0）
}

/** 商品规格初始化响应数据 */
export interface GoodsSpecData {
  goods_id: number;
  goods_name: string;
  image: string;
  base_price: string; // 商品基础价格
  has_spec: boolean; // 是否有多规格
  dimensions: SpecDimension[];
  skus: SkuInfo[];
}

/** 标准化API响应结构 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}
