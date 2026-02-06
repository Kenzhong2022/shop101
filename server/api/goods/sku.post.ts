// SKU请求参数（根据商品ID查SKU）
export interface SkuListRequest {
  goods_id: number; // 必传：商品ID
}

// SKU数据结构（对应数据库的goods_sku表）
export interface GoodsSku {
  sku_code: string; // SKU编码
  spec_json: Record<string, string>; // 规格组合（JSON解析后的对象）
  price: number; // SKU价格
  original_price?: number; // 原价（可选）
  stock: number; // SKU库存
  sales_count: number; // SKU销量
  sku_image: string; // SKU图片
  is_enable: number; // 是否启用（1=启用）
}

// SKU响应格式

import getNeon from "~~/server/utils/neon";
const mySql = getNeon();
