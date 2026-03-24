/**
 * 订单相关类型定义
 * @description 此文件只包含类型定义和常量，不包含服务器端代码
 * 可供前端和后端共享使用
 */

// ==================== 订单列表相关类型 ====================

/** 订单列表请求参数 */
export interface OrderListRequestDTO {
  order_shop_id?: number;
  goods_name?: string;
  sku_code?: string;
  sku_value?: string;
  shop_name?: string;
  item_status?: number;
  created_at?: string | Date; // 前端传过来通常是字符串
  updated_at?: string | Date;
  page?: number;
  pageSize?: number;
}

/** 内部订单项（商品维度） */
export interface OrderItem {
  order_shop_id: number;
  slave_order_no: string;
  goods_id: number;
  goods_name: string;
  image: string;
  price: number;
  quantity: number;
  sku_code: string;
  sku_value: string;
  shop_name: string;
  item_status: number;
  created_at: string | Date;
  updated_at: string | Date;
  shop_order_status: number;
  shop_payment_status: number;
  shop_expire_at: Date;
  is_expired: boolean;
}

/** 订单列表响应 */
export interface OrderListResponseDTO {
  code: number;
  msg: string;
  data: {
    OrderList: OrderItem[];
    total?: number;
  };
}

// ==================== 订单状态枚举 ====================

/** 订单状态枚举（与后端一致） */
export enum OrderStatus {
  ALL = 0, // 所有状态
  PENDING_PAYMENT = 1, // 待支付
  PENDING_SHIPMENT = 2, // 已支付/待发货
  PENDING_RECEIPT = 3, // 已发货
  COMPLETED = 4, // 已完成
  CANCELLED = 5, // 已过期/已取消/已退款
}

/** 状态对应的中文标签 */
export const ORDER_STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  [OrderStatus.ALL]: "所有状态",
  [OrderStatus.PENDING_PAYMENT]: "待支付",
  [OrderStatus.PENDING_SHIPMENT]: "已支付/待发货",
  [OrderStatus.PENDING_RECEIPT]: "已发货",
  [OrderStatus.COMPLETED]: "已完成",
  [OrderStatus.CANCELLED]: "已过期/已取消/已退款",
};

// ==================== 订单创建相关类型 ====================

// 地址信息
export interface AddressDTO {
  name: string;
  phone: string;
  detail: string;
}

/** 购物车项（来自前端） */
export interface CartItemRequest {
  id: number; // 购物车记录ID，用于清理
  goods_id: number;
  goods_name: string;
  shop_name: string;
  shop_id: number;
  image: string;
  price: string; // 前端传来的是字符串，需要转数字
  quantity: number;
  stock: number; // 仅用于前端展示
  sku_code: string;
  sku_value: string;
}

/** 创建订单请求体 */
export interface CreateOrderRequestDTO {
  items: CartItemRequest[];
  address?: AddressDTO;
  remark?: string;
}

/** 内部订单项（商品维度） */
export interface OrderItemData {
  id?: number; // 自增主键 (BIGSERIAL PRIMARY KEY)
  order_shop_id?: number; // 关联子订单ID (BIGINT NOT NULL)
  goods_id: number; // 商品ID (BIGINT NOT NULL)
  goods_name: string; // 商品名称 (VARCHAR(255) NOT NULL)
  quantity: number; // 商品数量 (INTEGER NOT NULL DEFAULT 1)
  price: number; // 商品单价 (NUMERIC(10, 2) NOT NULL)
  total: number; // 商品总价 (NUMERIC(10, 2) NOT NULL)
  sku_code: string; // 商品规格编码 (VARCHAR(64))
  sku_value: string; // 商品规格值 (VARCHAR(500))
  image: string; // 商品图片 (VARCHAR(500))
  shop_name: string; // 店铺名称 (VARCHAR(100))
  shop_id: number; // 店铺ID (BIGINT NOT NULL)
  item_status?: number; // 商品项状态 (SMALLINT DEFAULT 0)
  created_at?: Date; // 创建时间 (TIMESTAMP WITH TIME ZONE DEFAULT now())
  updated_at?: Date; // 更新时间 (TIMESTAMP WITH TIME ZONE DEFAULT now())
  deleted_at?: Date; // 软删除时间 (TIMESTAMP WITH TIME ZONE)
  slave_order_no: string; // 子订单号
}

/** 内部子订单（店铺维度） */
export interface SubOrderData {
  slave_order_no: string;
  master_order_no: string;
  shop_id: number;
  shop_name: string;
  total_amount: number;
  payment_amount: number;
  discount_amount: number;
  order_status: number; // 0-待付款
  payment_status: number; // 0-待付款
  shipping_status: number; // 0-未发货
  consignee: string;
  phone: string;
  address: string;
  remark: string;
  items: OrderItemData[];
  created_at: Date;
  expire_at: Date;
}

/** 返回给前端的商品项 VO */
export interface OrderItemVO {
  goodsId: number;
  goodsName: string;
  quantity: number;
  priceDisplay: string;
  totalDisplay: string;
  skuInfo: string;
  image: string;
  shopName: string;
}

/** 返回给前端的子订单 VO */
export interface SubOrderVO {
  orderNo: string; // slave_order_no
  shopId: number;
  shopName: string;
  amountDisplay: string;
  itemCount: number;
  statusLabel: string;
  paymentStatusLabel: string;
  items: OrderItemVO[];
}

/** 创建订单响应 VO */
export interface OrderCreateResponse {
  code: number;
  msg: string;
  data: {
    masterOrderNo: string;
    subOrders: SubOrderVO[];
    totalAmountDisplay: string;
    createdAt: string;
    expireTime: string;
  };
}
