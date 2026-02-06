import getNeon from "~~/server/utils/neon";
import { defineEventHandler, getRouterParam, getQuery, createError } from "h3";
import type { ApiResponse, ReviewListData, GoodsReview } from "~/types/review";

const mySql = getNeon();

// 常量配置
/**
 * 商品评论列表接口配置
 * - DEFAULT_PAGE_SIZE: 默认每页评论数
 * - MAX_PAGE_SIZE: 最大每页评论数
 * - ALLOWED_SORT: 允许的排序字段
 *   - newest: 最新评论
 *   - rating: 评分最高优先
 *   - likes: 点赞数最多优先
 */
const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  ALLOWED_SORT: {
    newest: "gr.created_at DESC",
    rating: "gr.rating DESC, gr.created_at DESC",
    likes: "gr.likes_count DESC, gr.created_at DESC",
  } as const,
} as const;

/**
 * 转换为整数，无效值返回默认值
 * @param val 待转换值
 * @param def 默认值
 * @returns 转换后的整数
 */
const toInt = (val: unknown, def: number): number => {
  const n = Number(val);
  return isNaN(n) ? def : n;
};

export default defineEventHandler(
  async (event): Promise<ApiResponse<ReviewListData>> => {
    try {
      // 1. 解析参数
      const rawId = getRouterParam(event, "id");
      if (!rawId || isNaN(Number(rawId))) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid goods ID",
        });
      }
      const goodsId = Number(rawId);

      const query = getQuery(event);
      const page = Math.max(1, toInt(query.page, 1));
      const pageSize = Math.min(
        CONFIG.MAX_PAGE_SIZE,
        Math.max(1, toInt(query.page_size, CONFIG.DEFAULT_PAGE_SIZE)),
      );
      const offset = (page - 1) * pageSize;

      // 2. 查询数据（参数化，安全）
      const [reviews, [{ count }]] = await Promise.all([
        mySql`
          SELECT 
            gr.id, gr.goods_id, gr.sku_id, gr.user_id,
            gr.rating, gr.content, gr.images, gr.spec_snapshot,
            gr.likes_count, gr.reply_count, gr.created_at, gr.updated_at,
            u.username as user_name, u.avatar as user_avatar
          FROM goods_reviews gr
          LEFT JOIN users u ON gr.user_id = u.id
          WHERE gr.goods_id = ${goodsId}
            AND gr.status = 1 
            AND gr.is_show = 1
          ORDER BY ${
            CONFIG.ALLOWED_SORT[
              String(query.sort) as keyof typeof CONFIG.ALLOWED_SORT
            ] ?? CONFIG.ALLOWED_SORT.newest
          }
          LIMIT ${pageSize} OFFSET ${offset}
        `,
        mySql`
          SELECT COUNT(*)::int as count
          FROM goods_reviews
          WHERE goods_id = ${goodsId}
            AND status = 1 
            AND is_show = 1
        `,
      ]);

      // 3. 查询统计和回复
      const [stats, replies] = await Promise.all([
        page === 1 ? fetchStats(mySql, goodsId) : undefined,
        reviews.length > 0
          ? fetchReplies(
              mySql,
              reviews.map((r) => r.id),
            )
          : [],
      ]);

      const total = Number(count);

      return {
        code: 200,
        data: {
          list: reviews.map((r) => formatReview(r, replies)),
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
          stats,
        },
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error("Review list error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch reviews",
      });
    }
  },
);

// 辅助函数（放在文件底部或单独文件）
function formatReview(r: any, replies: any[]): GoodsReview {
  return {
    id: r.id,
    goods_id: r.goods_id,
    sku_id: r.sku_id,
    user_id: r.user_id,
    rating: r.rating,
    content: r.content,
    images: parseImages(r.images),
    spec_snapshot: r.spec_snapshot,
    likes_count: r.likes_count,
    reply_count: r.reply_count,
    user: {
      id: r.user_id,
      user_name: r.user_name || `用户${r.user_id}`,
      avatar: r.user_avatar,
    },
    replies: replies.filter((rep) => rep.review_id === r.id),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function parseImages(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(String(images));
  } catch {
    return [];
  }
}

async function fetchStats(sql: any, goodsId: number) {
  const [[result], rows] = await Promise.all([
    sql`
      SELECT 
        COUNT(*)::int as total,
        COALESCE(AVG(rating), 0)::numeric(3,1) as avg,
        COUNT(*) FILTER (WHERE images IS NOT NULL)::int as with_image
      FROM goods_reviews
      WHERE goods_id = ${goodsId} AND status = 1 AND is_show = 1
    `,
    sql`
      SELECT rating, COUNT(*)::int as count
      FROM goods_reviews
      WHERE goods_id = ${goodsId} AND status = 1 AND is_show = 1
      GROUP BY rating
      ORDER BY rating DESC
    `,
  ]);

  return {
    total_count: result.total,
    rating_avg: result.avg,
    has_image_count: result.with_image,
    rating_distribution: Object.fromEntries(
      rows.map((r: any) => [r.rating, r.count]),
    ),
  };
}

async function fetchReplies(sql: any, reviewIds: number[]) {
  return sql`
    SELECT review_id, id, content, is_merchant, created_at
    FROM goods_review_replies
    WHERE review_id = ANY(${reviewIds})
    ORDER BY created_at ASC
  `;
}
