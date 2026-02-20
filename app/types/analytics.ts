// types/analytics.ts

/**
 * 用户商品行为数据表结构
 * 对应数据库表: user_product_behavior
 */
export interface UserProductBehavior {
  /** 主键ID */
  id: number;

  /** 用户ID（登录用户） */
  user_id: string | null;

  /** 会话ID（未登录用户，必填） */
  session_id: string;

  /** 商品ID（必填） */
  goods_id: string;

  /** 行为类型（必填）: view|click|cart|order|fav|share */
  behavior_type: BehaviorType;

  /** 停留时长（毫秒，view行为时有值） */
  duration_ms: number | null;

  /** 数量（cart/order行为时有值） */
  quantity: number | null;

  /** 价格（cart/order行为时有值） */
  price: number | null;

  /** 扩展字段（JSON格式） */
  extra: Record<string, any>;

  /** 来源页面 */
  source_page: string | null;

  /** 设备类型: mobile|pc|tablet|miniapp */
  device_type: string | null;

  /** 创建时间 */
  created_at: string; // ISO 8601 格式
}

/**
 * 行为类型枚举
 */
export type BehaviorType =
  | "view" // 浏览
  | "click" // 点击
  | "cart" // 加购
  | "order" // 下单
  | "fav" // 收藏
  | "share"; // 分享

/**
 * 设备类型枚举
 */
export type DeviceType =
  | "mobile" // 移动端
  | "pc" // 电脑端
  | "tablet" // 平板
  | "miniapp"; // 小程序

/**
 * 数据库索引定义（用于迁移文件或文档）
 */
export interface DatabaseIndexes {
  /** 用户+时间索引 */
  idx_user_time: ["user_id", "created_at"];

  /** 商品+时间索引 */
  idx_product_time: ["goods_id", "created_at"];

  /** 行为类型+时间索引 */
  idx_behavior: ["behavior_type", "created_at"];

  /** 会话+时间索引 */
  idx_session_time: ["session_id", "created_at"];
}

/**
 * 创建行为记录请求参数
 */
export interface CreateBehaviorRequest {
  goodsId: string;
  behaviorType: BehaviorType;
  duration?: number; // 毫秒
  quantity?: number;
  price?: number;
  extra?: Record<string, any>;
  sourcePage?: string;
  deviceType?: DeviceType;
  timestamp?: string; // ISO 8601
}

/**
 * 扩展字段示例类型（可选，用于代码提示）
 */
export interface ViewExtra {
  scroll_depth?: number; // 滚动深度 0-1
}

export interface ClickExtra {
  target?: string; // 点击目标: buy_btn|image|title
}

export interface CartExtra {
  sku_id?: string; // SKU ID
  coupon_used?: boolean; // 是否使用优惠券
}

export interface OrderExtra {
  order_id?: string; // 订单号
  status?: "pending" | "paid" | "cancelled";
}
