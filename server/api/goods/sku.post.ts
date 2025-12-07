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
export interface SkuListResponse {
  code: number;
  msg: string;
  data: {
    specGroups: {
      // 规格组（前端渲染选择器用）
      specType: string; // 规格类型（如“颜色”）
      specValues: {
        value: string;
        isAvailable: boolean;
      }[]; // 规格选项（如["蓝色","粉色"]）
    }[];
    skuList: GoodsSku[]; // 该商品的所有SKU列表
    skuMap: Record<string, GoodsSku>; // 规格组合→SKU的映射（前端快速匹配）
  };
}

import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

// 新增：获取商品SKU列表接口
export default defineEventHandler(async (event): Promise<SkuListResponse> => {
  console.log("🔍 商品SKU列表接口被调用 ");

  // 1. 获取请求参数（商品ID）
  const body: SkuListRequest = await readBody(event);
  if (!body.goods_id) {
    return {
      code: 400,
      msg: "商品ID不能为空",
      data: { specGroups: [], skuList: [], skuMap: {} },
    };
  }
  console.log("📋 接收到的商品ID:", body.goods_id);

  try {
    // 2. 查询该商品的所有启用SKU（从goods_sku表）
    const skuRows = await mySql`
      SELECT sku_code, spec_json, price, original_price, stock, sales_count, sku_image, is_enable
      FROM goods_sku
      WHERE goods_id = ${body.goods_id} AND is_enable = 1
    `;
    console.log("SKU数据库查询结果:", skuRows);

    if (skuRows.length === 0) {
      return {
        code: 200,
        msg: "该商品暂无SKU",
        data: { specGroups: [], skuList: [], skuMap: {} },
      };
    }

    // 1. 新建一个Map：key=规格类型（如“颜色”），value=Set（存该类型的所有可选值，自动去重）
    const specTypeMap = new Map<string, Set<string>>();

    // 2. 遍历每一条SKU数据
    skuRows.forEach((sku) => {
      // 2.1 把数据库的JSON字符串转成JS对象（如果数据库驱动已自动解析，这步可省）
      // 比如 sku.spec_json 是字符串 '{"颜色":"粉色","尺码":"XL"}' → 转成 {颜色: "粉色", 尺码: "XL"}
      const specJson =
        typeof sku.spec_json === "string"
          ? JSON.parse(sku.spec_json)
          : sku.spec_json;
      // 此时 specJson = {颜色: "粉色", 尺码: "XL"}（第一条SKU）

      // 2.2 遍历当前SKU的所有规格键值对（如 ["颜色", "粉色"], ["尺码", "XL"]）
      Object.entries(specJson).forEach(([type, value]) => {
        // 2.3 如果Map中没有这个规格类型（比如第一次遇到“颜色”），就新建一个Set
        if (!specTypeMap.has(type)) {
          specTypeMap.set(type, new Set()); // 比如 type="颜色" → Map中添加 "颜色" → 空Set
        }
        // 2.4 把当前规格值加入Set（Set自动去重，就算有重复值也只存一次）
        specTypeMap.get(type)!.add(value as string);
        // 第一条SKU："颜色"的Set添加"粉色" → Set {"粉色"}；"尺码"的Set添加"XL" → Set {"XL"}
        // 第二条SKU："颜色"的Set添加"蓝色" → Set {"粉色", "蓝色"}；"尺码"的Set添加"M" → Set {"XL", "M"}
      });
    });

    // 3. 把Map转成前端需要的数组格式（Set转数组，方便渲染）
    const specGroups = Array.from(specTypeMap.entries()).map(
      ([type, values]) => ({
        specType: type, // 规格类型（如"颜色"）
        specValues: Array.from(values).map((value) => ({
          value, // 规格值（如"粉色"）
          isAvailable: true, // 默认可用，后续可以根据库存等逻辑判断
        })), // 转换为对象数组，包含value和isAvailable属性
      })
    );

    // 4. 构建SKU映射（规格组合→SKU）
    const skuMap: Record<string, GoodsSku> = {};
    skuRows.forEach((sku) => {
      const specJson =
        typeof sku.spec_json === "string"
          ? JSON.parse(sku.spec_json)
          : sku.spec_json;

      // 生成规格组合的key（如“颜色-蓝色|尺码-M”）
      const specKey = Object.entries(specJson)
        .sort(([aType], [bType]) => aType.localeCompare(bType))
        .map(([type, value]) => `${type}-${value}`)
        .join("|");

      skuMap[specKey] = {
        sku_code: sku.sku_code,
        spec_json: specJson,
        price: sku.price,
        original_price: sku.original_price,
        stock: sku.stock,
        sales_count: sku.sales_count,
        sku_image: sku.sku_image,
        is_enable: sku.is_enable,
      };
    });

    // 5. 返回结果
    return {
      code: 200,
      msg: "商品SKU获取成功",
      data: {
        specGroups,
        skuList: skuRows.map((sku) => ({
          sku_code: sku.sku_code,
          spec_json: sku.spec_json,
          price: sku.price,
          original_price: sku.original_price,
          stock: sku.stock,
          sales_count: sku.sales_count,
          sku_image: sku.sku_image,
          is_enable: sku.is_enable,
        })),
        skuMap,
      },
    };
  } catch (error) {
    console.error("SKU查询错误:", error);
    return {
      code: 500,
      msg: `SKU查询失败: ${error}`,
      data: { specGroups: [], skuList: [], skuMap: {} },
    };
  }
});
