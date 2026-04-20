// 添加到购物车接口
import type {
  CartAddRequest,
  CartAddResponse,
  CartAddResponseData,
} from "~~/server/types/cart";

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();
//====================导入认证工具=========================
import { requireAuth } from "~~/server/utils/auth";
/**
 * 添加商品到购物车
 */
export default defineEventHandler(async (event): Promise<CartAddResponse> => {
  console.log("🛒 添加到购物车API被调用");
  // 构建数据库插入数据
  const { code, message, data } = await requireAuth(event);
  const userId = data?.userId;
  console.log("🔑 解析到的用户ID:", userId);
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "用户未登录",
    });
  }
  try {
    // 1. 获取请求参数
    const body: CartAddRequest = await readBody(event);
    console.log("📋 接收到的请求参数:", body);
    const { goods_id, sku_code, quantity = 1, sku_value } = body;

    // 2. 参数验证
    if (!goods_id || !sku_code) {
      console.error("❌ 商品ID或规格编码不能为空:", { goods_id, sku_code });
      throw createError({
        statusCode: 400,
        message: "商品ID和规格编码不能为空",
      });
    }

    // 4. 检查商品是否存在且库存充足
    const stockResult = await mySql`
        SELECT stock FROM skus WHERE goods_id = ${goods_id} AND sku_code = ${sku_code}
      `;
    console.log("🔍 查询到的库存结果:", stockResult[0].stock);
    if (stockResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: "商品不存在",
      });
    }

    if (stockResult[0].stock < quantity) {
      throw createError({
        statusCode: 400,
        message: "商品库存不足",
      });
    }

    // 5. 检查购物车中是否已存在该商品（基于user_id和sku_code的唯一约束）
    const existingCartItem = await mySql`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = ${userId} AND sku_code = ${sku_code}
      `;

    let cart_id: number;
    let added_quantity: number;

    if (existingCartItem.length > 0) {
      // 如果已存在，更新数量
      cart_id = existingCartItem[0].id;
      added_quantity = quantity;
      await mySql`
          UPDATE cart_items 
          SET quantity = quantity + ${quantity}, updated_at = NOW()
          WHERE id = ${cart_id}
        `;
    } else {
      // 如果不存在，插入新记录
      const insertResult = await mySql`
          INSERT INTO cart_items (user_id, goods_id, sku_code, quantity, created_at, updated_at, sku_value)
          VALUES (${userId}, ${goods_id}, ${sku_code}, ${quantity}, NOW(), NOW(), ${sku_value})
          RETURNING id
        `;
      cart_id = insertResult[0].id;
      added_quantity = quantity;
    }

    // 6. 获取购物车总数量
    const totalResult = await mySql`
        SELECT SUM(quantity) as total_quantity FROM cart_items WHERE user_id = ${userId}
      `;

    console.log("✅ 添加成功，购物车ID:", cart_id);

    // 7. 返回响应
    return {
      code: 200,
      msg: "添加购物车成功",
      data: {
        cart_id,
        total_quantity: totalResult[0]?.total_quantity || 0,
        added_quantity,
      } as CartAddResponseData,
    };
  } catch (error) {
    console.error("❌ 添加购物车失败123:", error);

    throw createError({
      statusCode: 500,
      message: "添加购物车失败",
    });
  }
});

// 重新导出类型，供其他服务器端文件使用
export type {
  CartAddRequest,
  CartAddResponse,
  CartAddResponseData,
} from "~~/server/types/cart";
