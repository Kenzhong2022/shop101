// 购物车列表接口

// 请求参数
export interface CartListRequest {
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
  userId?: number; // 用户ID（可选）
}

export interface GoodsItem {
  id: number; // 购物车项ID
  goods_id: number; // 商品ID（后端返回的是字符串）
  goods_name: string; // 商品名称
  shop_name: string; // 店铺名称
  shop_id: number; // 店铺ID
  image: string; // 商品图片
  price: string; // 商品价格（后端返回的是字符串）
  quantity: number; // 商品数量
  stock: number; // 库存数量
  sku_code: string; // 商品规格编码
  sku_value: string; // 商品规格值
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  selected?: boolean; // 是否选中（前端用，可选）
}

// 响应数据
export interface CartListResponseData {
  CartList: GoodsItem[]; // 购物车商品列表
}

// 响应结构
export interface CartListResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: CartListResponseData;
}

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();
//====================导入认证工具=========================
import { requireAuth } from "~~/server/utils/auth";
/**
 * 获取购物车列表
 */
export default defineEventHandler(async (event): Promise<CartListResponse> => {
  console.log("🛒 获取购物车列表API被调用");
  const { userId } = await requireAuth(event);
  console.log("🔑 解析到的用户ID:", userId);
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "用户未登录",
    });
  }
  try {
    // 1. 获取请求参数
    const body: CartListRequest = await readBody(event);
    console.log("📋 接收到的请求参数:", body);
    const { page = 1, page_size = 10 } = body;

    // 3. 查询购物车数据 goods_id 转换为数字
    const result = await mySql`
        SELECT 
          c.id,
          c.goods_id::BIGINT AS goods_id,
          g.goods_name,
          g.shop_name,
          g.shop_id,
          g.image,
          s.price,
          c.quantity,
          s.stock,
          c.sku_code,
          c.sku_value,
          c.created_at,
          c.updated_at
        FROM cart_items c
        INNER JOIN goods g ON c.goods_id = g.id
        INNER JOIN skus s ON c.sku_code = s.sku_code
        WHERE c.user_id = ${userId}
        ORDER BY c.created_at DESC
        LIMIT ${page_size} OFFSET ${(page - 1) * page_size}
      `;

    console.log("✅ 查询结果:", result);
    // 6. 返回响应
    return {
      code: 200,
      msg: "获取购物车列表成功",
      data: {
        CartList: result as GoodsItem[],
      },
    };
  } catch (error) {
    console.error("❌ 获取购物车列表失败:", error);

    throw createError({
      statusCode: 500,
      message: "获取购物车列表失败",
    });
  }
});
