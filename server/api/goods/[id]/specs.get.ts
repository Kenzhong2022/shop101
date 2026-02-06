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

import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

import { defineEventHandler, getRouterParam, createError } from "h3";

export default defineEventHandler(
  async (event): Promise<ApiResponse<GoodsSpecData>> => {
    try {
      // 从路由参数获取商品ID
      const goodsId = getRouterParam(event, "id");
      console.log("【API】收到请求，goodsId:", goodsId);

      // 验证商品ID是否为数字
      if (!goodsId || isNaN(Number(goodsId))) {
        console.log("【错误】商品ID无效:", goodsId);
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid goods ID",
        });
      }

      // 转换商品ID为数字类型
      const id = Number(goodsId);

      // 并行查询商品信息、规格维度、SKU
      const [goods, dimensions, skus] = await Promise.all([
        // 查询商品基本信息
        mySql`
        SELECT id, goods_name, image, price 
        FROM homepage_goods 
        WHERE id = ${id}
      `,

        // 查询规格维度（按 sort_order 排序）
        mySql`
        SELECT id, name, code, sort_order 
        FROM spec_dimensions 
        WHERE goods_id = ${id} 
        ORDER BY sort_order ASC
      `,

        // 查询所有SKU（包括库存为0的，用于前端计算禁用）
        mySql`
        SELECT id, sku_code, price, stock, specs_hash, 
               string_to_array(specs_hash, '|') as specs
        FROM skus 
        WHERE goods_id = ${id}
      `,
      ]);

      if (goods.length === 0) {
        console.log("【错误】商品不存在, id:", id);
        throw createError({
          statusCode: 404,
          statusMessage: "Goods not found",
        });
      }

      // 如果没有规格数据，说明该商品没有多规格
      if (dimensions.length === 0) {
        // console.log("【提示】该商品没有多规格, goods_id:", id);
        return {
          code: 200,
          data: {
            goods_id: id,
            goods_name: goods[0].goods_name,
            image: goods[0].image,
            base_price: goods[0].price,
            has_spec: false,
            dimensions: [],
            skus: [],
          },
        };
      }
      /**
       * 生成SQL占位符，用于 IN 子查询
       * @param arr 数组元素，例如 [1,2,3]
       * @param startIndex 占位符起始索引，默认从1开始
       * @returns 生成的占位符字符串，例如 "$1, $2, $3"
       */
      function generatePlaceholders(arr: any[], startIndex = 1): string {
        return arr.map((_, i) => `$${i + startIndex}`).join(", ");
      }

      // 使用
      const dimensionIds = dimensions.map((d) => Number(d.id)); // 确保是数字

      // console.log("【处理】dimensionIds:", dimensionIds);

      const placeholders = generatePlaceholders(dimensionIds);
      // console.log("【处理】生成的SQL占位符:", placeholders);

      // 查询对应的规格值
      // console.log("【查询】开始查询 spec_values, SQL条件: IN", dimensionIds);
      // 方案 A：使用 = ANY(数组) - 最简单，无需处理占位符
      // console.log("【处理】dimensionIds:", dimensionIds);

      const values = await mySql`
    SELECT id, dimension_id, name, code, sort_order
    FROM spec_values 
    WHERE dimension_id = ANY(${dimensionIds}::int[])
    ORDER BY sort_order ASC
`;

      // console.log("【查询结果】spec_values数量:", values.length);
      // console.log(
      // "【查询结果】spec_values内容:",
      // JSON.stringify(values, null, 2),
      // );

      // 组装 dimensions 结构，把 values 嵌入
      // console.log("【组装】开始组装 dimensionsWithValues...");
      const dimensionsWithValues = dimensions.map((dim) => {
        const dimValues = values.filter((v) => v.dimension_id === dim.id);
        console.log(
          `【组装】维度 ${dim.name}(id:${dim.id}) 找到 ${dimValues.length} 个值`,
        );
        return {
          id: dim.id,
          name: dim.name,
          code: dim.code,
          sort_order: dim.sort_order,
          values: dimValues.map((v) => ({
            id: v.id,
            name: v.name,
            code: v.code,
            sort_order: v.sort_order,
          })),
        };
      });

      // 格式化 SKU 数据，确保 specs 数组顺序正确
      // console.log("【组装】开始格式化 SKU 数据...");
      const formattedSkus = skus.map((sku) => ({
        sku_id: sku.id,
        sku_code: sku.sku_code,
        specs_hash: sku.specs_hash,
        specs: sku.specs, // 已经是数组 ['red', 's', 'cotton']
        price: sku.price,
        stock: sku.stock,
        is_available: sku.stock > 0,
      }));

      // console.log("【组装】格式化后 SKU 数量:", formattedSkus.length);

      const responseData = {
        code: 200,
        data: {
          goods_id: id,
          goods_name: goods[0].goods_name,
          image: goods[0].image,
          base_price: goods[0].price,
          has_spec: true,
          dimensions: dimensionsWithValues,
          skus: formattedSkus,
        },
      } as ApiResponse<GoodsSpecData>;

      // console.log("【返回】最终数据结构预览:");
      // console.log("  - goods_id:", responseData.data.goods_id);
      // console.log("  - dimensions数量:", responseData.data.dimensions.length);
      // console.log("  - skus数量:", responseData.data.skus.length);
      // console.log(
      //   "  - 第一个dimension:",
      //   JSON.stringify(responseData.data.dimensions[0], null, 2),
      // );

      return responseData;
    } catch (error: any) {
      // 处理数据库连接错误
      if (error.statusCode) {
        console.log(
          "【已处理错误】statusCode:",
          error.statusCode,
          "message:",
          error.statusMessage,
        );
        throw error;
      }

      console.error("【未处理错误】Database error:", error);
      console.error("【错误详情】", error.stack);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  },
);
