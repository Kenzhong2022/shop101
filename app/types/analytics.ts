// types/analytics.ts

/**
 * 用户商品行为数据表结构
 * 对应数据库表: user_item_action
 */
export interface UserItemAction {
  /** 主键ID */
  id: number;

  /** 用户ID */
  user_id: number;

  /** 商品ID */
  item_id: number;

  /** 行为类型: 1=点击, 2=收藏, 3=加购, 4=购买 */
  action_type: ActionType;

  /** 行为权重: 1=点击, 3=收藏, 5=加购, 10=购买 */
  action_weight: ActionWeight;

  /** 行为发生时间 */
  action_time: Date;
}

/**
 * 行为类型枚举
 * 1=点击, 2=收藏, 3=加购, 4=购买
 */
export enum ActionType {
  Click = 1, // 点击
  Fav = 2, // 收藏
  Cart = 3, // 加购
  Buy = 4, // 购买
}

/**
 * 行为权重枚举
 * 权重值: 点击=1, 收藏=3, 加购=5, 购买=10
 */
export enum ActionWeight {
  Click = 1, // 点击权重 1
  Fav = 3, // 收藏权重 3
  Cart = 5, // 加购权重 5
  Buy = 10, // 购买权重 10
}

/**
 * 行为类型字符串映射（用于前端显示）
 */
export const ActionTypeName: Record<ActionType, string> = {
  [ActionType.Click]: "点击",
  [ActionType.Fav]: "收藏",
  [ActionType.Cart]: "加购",
  [ActionType.Buy]: "购买",
};

/**
 * 数据库索引定义
 */
export interface DatabaseIndexes {
  /** 用户+商品索引：快速查找指定用户对指定商品的所有行为 */
  idx_user_item: ["user_id", "item_id"];

  /** 时间索引：便于按时间范围清理或分析 */
  idx_action_time: ["action_time"];

  /** 商品+用户索引：物品向量构建时使用 */
  idx_item_user: ["item_id", "user_id"];
}

/**
 * 创建行为记录请求参数
 */
export interface CreateActionRequest {
  /** 商品ID */
  item_id: number;

  /** 行为类型: 1=点击, 2=收藏, 3=加购, 4=购买 */
  action_type: ActionType;

  /** 行为权重: 1, 3, 5, 10 */
  action_weight?: ActionWeight;

  /** 行为发生时间 */
  action_time?: string; // ISO 8601 格式

  /** 会话ID */
  session_id?: string; // 用于关联用户会话的唯一标识
}

/**
 * 行为统计响应
 */
export interface ActionStatsResponse {
  /** 商品ID */
  item_id: number;

  /** 行为类型 */
  action_type: ActionType;

  /** 行为次数 */
  count: number;

  /** 行为权重总和 */
  total_weight: number;
}

/**
 * 用户行为历史响应
 */
export interface UserActionHistoryResponse {
  /** 行为列表 */
  list: UserItemAction[];

  /** 总数 */
  total: number;

  /** 页码 */
  page: number;

  /** 每页数量 */
  page_size: number;
}
