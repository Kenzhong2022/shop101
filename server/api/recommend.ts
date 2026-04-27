// server/api/recommend.get.ts
import { defineEventHandler, getQuery } from "h3";
// 获取数据库连接（Neon serverless）
import getNeon from "~~/server/utils/neon";
const sql = getNeon();
const MAX_SEED_ITEMS = 10; // 取用户评分最高的10个物品作为种子
const TOP_N = 20; // 默认返回数量

// ---------- 获取用户最喜欢的物品（种子） ----------
async function getUserTopItems(userId: number, limit: number) {
  const res = await sql`
    SELECT item_id, rating
     FROM user_item_rating
     WHERE user_id = ${userId}
     ORDER BY rating DESC
     LIMIT ${limit}
  `;
  return res.map((row: any) => ({
    itemId: row.item_id,
    rating: row.rating,
  }));
}

// ---------- 获取物品的相似物品列表（已按相似度排序） ----------
async function getSimilarItems(itemId: number) {
  const res = await sql`
    SELECT similar_item_id, similarity_score
     FROM item_similarity
     WHERE item_id = ${itemId}
     ORDER BY rank ASC
  `;
  return res.map((row: any) => ({
    itemId: row.similar_item_id,
    score: row.similarity_score,
  }));
}

// ---------- 获取热门物品（全局交互人数最多的物品） ----------
async function getHotItems(limit: number, excludeIds: Set<number>) {
  const res = await sql`
    SELECT item_id, COUNT(DISTINCT user_id) as cnt
     FROM user_item_rating
     GROUP BY item_id
     ORDER BY cnt DESC
     LIMIT ${limit + 10}
  `;
  const hot = [];
  for (const row of res as any[]) {
    if (hot.length >= limit) break;
    if (!excludeIds.has(row.item_id)) {
      hot.push(row.item_id);
    }
  }
  return hot;
}
import { requireAuth } from "~~/server/utils/auth";
/**
 * 推荐物品
 * @param event
 * @returns 推荐物品ID列表
 */
export default defineEventHandler(
  async (event): Promise<{ items: number[] }> => {
    /** 接收查询参数 */
    const { limit = TOP_N } = getQuery(event);
    const { code, message, data } = await requireAuth(event);
    if (code !== 200) {
      throw createError({ statusCode: 401, message: message });
    }
    const uid = data!.userId;
    const reqLimit = parseInt(limit as string);

    /** 1. 获取用户的种子物品（用户隐形评分最高的10个物品） */
    const seedItems = await getUserTopItems(uid, MAX_SEED_ITEMS);
    const seedItemIds = new Set(seedItems.map((s) => s.itemId));

    // 2. 冷启动：没有历史行为 -> 返回热门物品
    if (seedItems.length === 0) {
      const hot = await getHotItems(reqLimit, new Set());
      return { items: hot };
    }

    // 3. 基于物品的召回与打分（相似物品 * 用户评分,相似度越接近1，评分越高）
    const candidateScores = new Map<number, number>(); // itemId -> 总分
    for (const seed of seedItems) {
      const simItems = await getSimilarItems(seed.itemId);
      for (const sim of simItems) {
        if (seedItemIds.has(sim.itemId)) continue; // 排除用户已经喜欢的物品
        const addScore = sim.score * seed.rating;
        const oldScore = candidateScores.get(sim.itemId) || 0;
        candidateScores.set(sim.itemId, oldScore + addScore);
      }
    }

    // 4. 如果没有任何候选（可能所有种子物品都没有相似记录），则直接返回热门
    if (candidateScores.size === 0) {
      const hot = await getHotItems(reqLimit, seedItemIds);
      return { items: hot };
    }

    // 5. 排序取 TopN
    const sorted = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, reqLimit)
      .map(([itemId]) => itemId);

    // 6. 不足 reqLimit 时，用热门物品补足
    if (sorted.length < reqLimit) {
      const need = reqLimit - sorted.length;
      const exclude = new Set([...sorted, ...seedItemIds]);
      const hot = await getHotItems(need, exclude);
      sorted.push(...hot);
    }

    return { items: sorted };
  },
);
