// stores/cart.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 购物车的接口导入
import {
  addCartApi,
  removeCartApi,
  updateCartApi,
  getCartListApi,
} from "@/api/cart";
import { createOrderApi } from "@/api/order";

// 商品item类型 - 完全匹配后端返回的数据结构
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

export interface ShopItem {
  shop_name: string; // 店铺名称
  items: GoodsItem[]; // 商品项列表
  selectedShop?: boolean; // 是否选中（前端用，可选）
}

// 可以新建一个类型，或直接使用 Pick
type AddCartParams = Pick<
  GoodsItem,
  "goods_id" | "quantity" | "sku_code" | "sku_value"
>;

export const useCartStore = defineStore("cart", () => {
  const { $message } = useNuxtApp();

  const router = useRouter();
  const isLoading = ref(false);
  // ==================== State ====================
  // 购物车列表
  const cartList = ref<ShopItem[]>([]);

  // 选中的商品项
  const selectedItems = computed(() =>
    cartList.value
      .flatMap((item) => item.items)
      .filter((item) => item.selected),
  );

  // 临时购买项（立即购买用，不加入购物车）
  const buyNowItem = ref<GoodsItem | null>(null);

  // ==================== Getters ====================
  // 购物车商品总数
  const totalCount = computed(() =>
    cartList.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  // 购物车选中商品总价（使用实际价格字段）
  const totalPrice = computed(() => {
    return selectedItems.value.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.price),
      0,
    );
  });

  // 是否全选
  const isAllSelected = computed(
    () =>
      cartList.value.length > 0 &&
      cartList.value
        .flatMap((item) => item.items)
        .every((item) => item.selected),
  );

  // ==================== Actions ====================

  /**
   * 添加商品到购物车
   * @param item 商品信息
   * @param isBuyNow 是否为立即购买（true则跳转结算，不加入购物车）
   */
  function addCart(item: AddCartParams, isBuyNow: boolean = false) {
    if (isBuyNow) {
      // 立即购买：存储临时项，跳转到结算页
      return;
    }
    addCartApi(item)
      .then((res) => {
        if (res.code === 200) {
        }
      })
      .catch((error) => {
        console.error("添加购物车失败:", error);
        $message.error("添加购物车失败");
      });

    // 可选：提示添加成功
    $message.success("已加入购物车");
  }

  /**
   * 删除商品（根据购物车项ID）
   */
  function removeCart(cartIds: number[]) {
    removeCartApi(cartIds)
      .then((res) => {
        if (res.code === 200) {
          // 刷新购物车列表
          loadCartList();
          $message.success("已从购物车移除");
        }
      })
      .catch((error) => {
        console.error("删除购物车项失败:", error);
        $message.error("删除购物车项失败");
      });
  }

  /**
   * 更新商品数量（根据购物车项ID）
   */
  function updateCount(cartId: number, count: number) {
    const item = cartList.value.find((item) => item.id === cartId);
    if (item) {
      item.quantity = Math.max(1, count); // 至少1件
    }
  }

  /**
   * 切换选中状态（根据购物车项ID）
   */
  function toggleSelect(cartId: number, selected: boolean, shopName: string) {
    const shop = cartList.value.find((item) => item.shop_name === shopName);
    if (shop) {
      const item = shop.items.find((item) => item.id === cartId);
      if (item) {
        item.selected = selected;
      }
    }
  }

  /**
   * 切换店铺选中状态
   */
  function toggleShopSelect(shopName: string, selected: boolean) {
    const shop = cartList.value.find((item) => item.shop_name === shopName);
    if (shop) {
      shop.selectedShop = selected;
    }
  }

  /**
   * 全选/取消全选
   */
  function toggleSelectAll(selected: boolean) {
    cartList.value.forEach((item) =>
      item.items.forEach((item) => (item.selected = selected)),
    );
  }

  /**
   * 清空购物车
   */
  function clearCart() {
    cartList.value = [];
  }

  /**
   * 获取立即购买项（结算页使用）
   */
  function getBuyNowItem(): GoodsItem | null {
    return buyNowItem.value;
  }

  /**
   * 清空立即购买项
   */
  function clearBuyNow() {
    buyNowItem.value = null;
  }

  // 辅助函数：获取商品价格（实际项目中从商品库或API获取）
  function getGoodsPrice(goodsId: number): number {
    // 这里应该调用商品服务获取价格
    return 0;
  }

  /**
   * 创建订单
   */
  function createOrder(items: GoodsItem[]) {
    return createOrderApi({
      items,
    });
  }

  /**
   * 加载购物车列表（从后端获取并赋值）
   */
  async function loadCartList() {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const res = await getCartListApi({ page: 1, page_size: 100 }); // 按需分页
      if (res.code === 200 && res.data.CartList) {
        const rawList = res.data.CartList; // 你的原始数据
        // 聚合返回的购物车项，根据shop_name分组
        const shopMap: Record<string, ShopItem> = {};
        rawList.forEach((item: GoodsItem) => {
          if (!shopMap[item.shop_name]) {
            shopMap[item.shop_name] = {
              shop_name: item.shop_name, // 店名
              items: [], // 准备一个空篮子装商品
            };
          }
          shopMap[item.shop_name]!.items.push(item);
        });
        const groupedData = Object.values(shopMap);
        console.log(groupedData);
        cartList.value = Object.values(shopMap);
      } else {
        cartList.value = [];
      }
    } catch (error) {
      console.error("加载购物车失败:", error);
      $message.error("加载购物车失败");
      cartList.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    isLoading,
    cartList,
    selectedItems,
    buyNowItem,
    // Getters
    totalCount,
    totalPrice,
    isAllSelected,
    // Actions
    addCart,
    removeCart,
    updateCount,
    toggleSelect,
    toggleSelectAll,
    clearCart,
    getBuyNowItem,
    createOrder,
    clearBuyNow,
    loadCartList,
  };
});
