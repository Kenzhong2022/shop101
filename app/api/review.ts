// 评论相关接口
import type {
  ReviewListRequest,
  ReviewListData,
  GoodsReview,
  CreateReviewRequest,
  ApiResponse,
} from "~/types/review";

// 获取axios实例（复用你的模式）
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

/**
 * 获取商品评论列表
 * GET /api/goods/{goods_id}/reviews
 */
export async function apiGoodsReviews(
  params: ReviewListRequest,
): Promise<ApiResponse<ReviewListData>> {
  const { goods_id, ...queryParams } = params;

  return getAxios()
    .get<ApiResponse<ReviewListData>>(`/goods/${goods_id}/reviews`, {
      params: queryParams,
    })
    .then((res) => res.data);
}

/**
 * 获取评论详情（单条）
 * GET /api/reviews/{review_id}
 */
export async function apiReviewDetail(
  reviewId: string | number,
): Promise<ApiResponse<GoodsReview>> {
  return getAxios()
    .get<ApiResponse<GoodsReview>>(`/api/reviews/${reviewId}`)
    .then((res) => res.data);
}

/**
 * 发布评论
 * POST /api/reviews
 */
export async function apiCreateReview(
  data: CreateReviewRequest,
): Promise<ApiResponse<GoodsReview>> {
  return getAxios()
    .post<ApiResponse<GoodsReview>>("/api/reviews", data)
    .then((res) => res.data);
}

/**
 * 点赞评论
 * POST /api/reviews/{review_id}/like
 */
export async function apiLikeReview(
  reviewId: string | number,
): Promise<ApiResponse<{ likes_count: number }>> {
  return getAxios()
    .post<ApiResponse<{ likes_count: number }>>(`/api/reviews/${reviewId}/like`)
    .then((res) => res.data);
}

/**
 * 删除自己的评论
 * DELETE /api/reviews/{review_id}
 */
export async function apiDeleteReview(
  reviewId: string | number,
): Promise<ApiResponse<void>> {
  return getAxios()
    .delete<ApiResponse<void>>(`/api/reviews/${reviewId}`)
    .then((res) => res.data);
}
