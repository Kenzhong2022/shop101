// 更新购物车商品数量接口

// 请求参数
export interface CartUpdateRequest {
  cart_id: number; // 购物车项ID
  quantity: number; // 新的数量
}

// 响应数据
export interface CartUpdateResponseData {
  cart_id: number; // 购物车项ID
  new_quantity: number; // 更新后的数量
  subtotal: number; // 小计金额
}

// 响应结构
export interface CartUpdateResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: CartUpdateResponseData;
}

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * 更新购物车商品数量
 */
export default defineEventHandler(
  async (event): Promise<CartUpdateResponse> => {
    console.log("🛒 更新购物车API被调用");

    try {
      // 1. 获取请求参数
      const body: CartUpdateRequest = await readBody(event);
      console.log("📋 接收到的请求参数:", body);
      const { cart_id, quantity } = body;

      // 2. 参数验证
      if (!cart_id || quantity < 0) {
        throw createError({
          statusCode: 400,
          message: "购物车ID不能为空，数量不能为负数",
        });
      }

      // 3. 获取用户ID
      const token = getCookie(event, "auth-token");
      const userId = token ? parseInt(token.split(".")[0]) : null;

      if (!userId) {
        throw createError({
          statusCode: 401,
          message: "用户未登录",
        });
      }

      // 4. 检查购物车项是否存在且属于当前用户
      const cartItem = await mySql`
        SELECT c.id, c.goods_id, c.quantity, c.sku_code, g.price, s.stock
        FROM cart_items c
        INNER JOIN goods g ON c.goods_id = g.id
        INNER JOIN skus s ON c.sku_code = s.sku_code
        WHERE c.id = ${cart_id} AND c.user_id = ${userId}
      `;

      if (cartItem.length === 0) {
        throw createError({
          statusCode: 404,
          message: "购物车项不存在或无权限",
        });
      }

      // 5. 如果数量为0，删除该购物车项
      if (quantity === 0) {
        await mySql`
          DELETE FROM cart_items WHERE id = ${cart_id}
        `;

        return {
          code: 200,
          msg: "购物车项已删除",
          data: {
            cart_id,
            new_quantity: 0,
            subtotal: 0,
          },
        };
      }

      // 6. 检查库存是否充足
      const stockResult = await mySql`
        SELECT stock FROM skus WHERE sku_code = ${cartItem[0].sku_code}
      `;

      if (stockResult[0].stock < quantity) {
        throw createError({
          statusCode: 400,
          message: "商品库存不足",
        });
      }

      // 7. 更新购物车数量
      await mySql`
        UPDATE cart_items 
        SET quantity = ${quantity}, updated_at = NOW()
        WHERE id = ${cart_id}
      `;

      // 8. 计算小计
      const subtotal = cartItem[0].price * quantity;

      console.log("✅ 更新成功，新的数量:", quantity);

      // 9. 返回响应
      return {
        code: 200,
        msg: "更新购物车成功",
        data: {
          cart_id,
          new_quantity: quantity,
          subtotal,
        },
      };
    } catch (error) {
      console.error("❌ 更新购物车失败:", error);

      throw createError({
        statusCode: 500,
        message: "更新购物车失败",
      });
    }
  },
);
