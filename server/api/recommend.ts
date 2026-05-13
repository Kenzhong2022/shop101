import getNeon from "~~/server/utils/neon";
import { requireAuth } from "~~/server/utils/auth";
export default defineEventHandler(async (event) => {
  const { userId } = event.context.user;
  // const userId = 10001;
  if (isNaN(userId)) {
    throw createError({ statusCode: 400, message: "Invalid user ID" });
  }

  const sql = getNeon();

  // 可选：从 query 参数获取推荐数量
  const query = getQuery(event);
  const limit = Math.min(Number(query.limit) || 20, 100);

  try {
    // 1. 获取用户已评分的物品
    const userItems = await sql`
      SELECT item_id, score
      FROM user_item_score
      WHERE user_id = ${userId} AND score > 0
    `;

    if (userItems.length === 0) {
      return {
        userId,
        recommendations: [],
        message: "User has no interactions",
      };
    }

    // 2. 使用 CTE 查询推荐（上面 SQL 的参数化版本）
    const recommendations = await sql`
      WITH user_items AS (
        SELECT item_id, score
        FROM user_item_score
        WHERE user_id = ${userId} AND score > 0
      ),
      candidates AS (
        SELECT 
          s.dst AS candidate_item,
          ui.item_id AS seed_item,
          ui.score AS seed_score,
          s.similarity_score
        FROM user_items ui
        JOIN item_similarity_bidirectional s 
        ON ui.item_id = s.src
        WHERE s.similarity_score > 0.05
      ),
      aggregated AS (
        SELECT
          candidate_item,
          SUM(seed_score * similarity_score) AS recommendation_score
        FROM candidates
        WHERE candidate_item NOT IN (SELECT item_id FROM user_items)
        GROUP BY candidate_item
      )
      SELECT 
        candidate_item AS item_id,
        recommendation_score
      FROM aggregated
      ORDER BY recommendation_score DESC
      LIMIT ${limit}
    `;

    return {
      userId,
      recommendations: recommendations.map((r) => ({
        itemId: r.item_id,
        score: Number(r.recommendation_score),
      })),
      count: recommendations.length,
    };
  } catch (error) {
    console.error("Recommendation error:", error);
    throw createError({ statusCode: 500, message: "Internal server error" });
  }
});
