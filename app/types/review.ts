/** 商家回复 */
export interface ReviewReply {
  id: string | number;
  content: string;
  is_merchant: boolean;
  created_at: string;
  user?: {
    id: string | number;
    nickname: string;
    avatar?: string;
  };
}

/** 评论图片 */
export interface ReviewImage {
  url: string;
  thumbnail?: string;
}

/** 单条评论 */
export interface GoodsReview {
  id: string | number;

  // 关联信息
  goods_id: number;
  sku_id?: number;
  user_id: number;

  // 评论内容
  rating: number; // 1-5星评分
  content: string; // 评论正文
  images?: string[];

  // 规格展示（核心字段）
  spec_snapshot: string; // 如："中国红|S|纯棉"

  // 互动统计
  likes_count: number;
  reply_count: number;

  // 用户信息（联表查询返回）
  user: {
    id: number;
    user_name: string;
    avatar?: string;
  };

  // 商家回复（可选，子查询）
  replies?: ReviewReply[];

  // 时间
  created_at: string;
  updated_at?: string;
}

/** 评论列表请求参数 */
export interface ReviewListRequest {
  goods_id: number;
  page?: number; // 默认1
  page_size?: number; // 默认10
  rating?: number; // 按评分筛选：1-5
  has_image?: boolean; // 筛选有图评价
  sort?: "newest" | "rating" | "likes"; // 排序方式
}

/** 评论列表响应数据 */
export interface ReviewListData {
  list: GoodsReview[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;

  // 统计信息
  stats?: {
    total_count: number;
    rating_avg: number;
    rating_distribution: {
      [key: number]: number; // {5: 100, 4: 50, 3: 20, 2: 5, 1: 2}
    };
    has_image_count: number;
  };
}

/** 提交评论请求 */
export interface CreateReviewRequest {
  goods_id: number;
  sku_id?: number;
  rating: number;
  content: string;
  images?: string[];
  spec_snapshot: string; // 前端传递当前选择的规格
}

/** 统一API响应包装 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}
