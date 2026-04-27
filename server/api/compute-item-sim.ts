// server/api/compute-similarity.post.ts
// 获取数据库连接（Neon serverless）
import getNeon from "~~/server/utils/neon";
const sql = getNeon();
// ---------- 配置参数 ----------
const TOP_K = 50; // 每个物品保留多少个相似物品
const MIN_COMMON_USERS = 2; // 最小共同用户数
const MIN_ITEM_INTERACTIONS = 0; // 物品最少被几个用户交互过才参与计算

// ---------- 1. 获取所有评分数据 ----------
async function fetchRatings() {
  // const res = await sql`SELECT user_id, item_id, rating FROM user_item_rating`;
  // return res;

  // 使用模拟数据进行测试
  return [
    { user_id: 1, item_id: 101, rating: 5 },
    { user_id: 1, item_id: 102, rating: 4 },
    { user_id: 2, item_id: 101, rating: 3 },
    { user_id: 2, item_id: 102, rating: 5 },
    { user_id: 2, item_id: 103, rating: 2 },
    { user_id: 3, item_id: 102, rating: 4 },
    { user_id: 3, item_id: 103, rating: 5 },
  ];
}
/**
 * 构建 item → Map(user → rating)
 * 用于计算物品物品相似度
 * @param rows 所有评分数据
 * @returns itemUserMap 物品用户评分映射
 */
function buildItemUserMap(rows: any[]) {
  // 通过物品ID分组，每个物品对应一个用户评分映射，键为用户ID，值为评分
  const itemUser = new Map<number, Map<number, number>>();
  for (const row of rows) {
    if (!itemUser.has(row.item_id)) {
      itemUser.set(row.item_id, new Map());
    }
    itemUser.get(row.item_id)!.set(row.user_id, row.rating);
  }
  return itemUser;
}
/**
 * 构建 user → Set(itemId) 倒排
 * 用于计算物品物品相似度
 * @param rows 所有评分数据
 * @returns userItemMap 用户物品ID集合
 */
function buildUserItemMap(rows: any[]) {
  // 通过用户ID分组，每个用户对应一个物品ID集合，键为用户ID，值为物品ID集合
  const userItem = new Map<number, Set<number>>();
  for (const row of rows) {
    if (!userItem.has(row.user_id)) {
      userItem.set(row.user_id, new Set());
    }
    userItem.get(row.user_id)!.add(row.item_id);
  }
  return userItem;
}

/**
 * 计算两个物品向量的余弦相似度
 * @param mapA 商品A的用户评分映射
 * @param mapB 商品B的用户评分映射
 * @returns 余弦相似度
 * */
function cosineSimilarity(
  mapA: Map<number, number>,
  mapB: Map<number, number>,
) {
  let dot = 0; // 点积
  let normA = 0; // 商品A的向量模长
  let normB = 0; // 商品B的向量模长
  /** 较少用户交互的商品 */
  const smaller = mapA.size < mapB.size ? mapA : mapB;
  /** 较多用户交互的商品 */
  const larger = smaller === mapA ? mapB : mapA;
  for (const [user, rating] of smaller) {
    const ratingOther = larger.get(user);
    if (ratingOther !== undefined) {
      dot = dot + rating * ratingOther;
    }
  }
  if (dot === 0) return 0;
  for (const rating of mapA.values()) normA += rating * rating;
  for (const rating of mapB.values()) normB += rating * rating;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---------- 5. 主计算流程 ----------
async function computeItemSimilarities() {
  console.log("Fetching user-item ratings...");
  const rows = await fetchRatings(); //数组对象
  rows.forEach((row) => {
    console.log(row);
  });
  /**
   * 过滤低频物品
   * 第一个是物品ID，第二个是出现次数
   */
  const itemFreq = new Map<number, number>();
  for (const records of rows) {
    itemFreq.set(records.item_id, (itemFreq.get(records.item_id) || 0) + 1);
  }
  // ✅ 打印 Map 所有内容
  // console.log("=== 物品出现频率 ===");
  // for (const [itemId, count] of itemFreq) {
  //   console.log(`物品ID: ${itemId}，出现次数: ${count}`);
  // }
  const validItems = new Set<number>();
  for (const [itemId, cnt] of itemFreq) {
    if (cnt >= MIN_ITEM_INTERACTIONS) validItems.add(itemId);
  }
  // 过滤低频物品
  const filteredRows = rows.filter((records) =>
    validItems.has(records.item_id),
  );
  console.log(`有效物品数量: ${validItems.size}`);

  /**
   * 构建 item → Map(user → rating)
   */
  const itemUserMap = buildItemUserMap(filteredRows);
  /**
   * 通过用户ID分组，每个用户对应一个物品ID集合，键为用户ID，值为物品ID集合
   */
  const userItemMap = buildUserItemMap(filteredRows);

  // 生成候选物品对（基于同一个用户交互过的物品） 商品A 和 商品B 配对 顺序不重要
  const candidatePairs = new Map<string, boolean>();
  for (const items of userItemMap.values()) {
    if (items.size < 2) continue; // 过滤掉用户交互过物品数量不足2个的用户ID
    const itemArray = Array.from(items); // 将物品ID集合转换为数组
    for (let i = 0; i < itemArray.length - 1; i++) {
      for (let j = i + 1; j < itemArray.length; j++) {
        const a = itemArray[i]; // 商品A 小的物品ID
        const b = itemArray[j]; // 商品B 大的物品ID
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        candidatePairs.set(key, true);
      }
    }
  }

  /**
   *
   */
  const similarities = new Map<
    number,
    Array<{ itemId: number; score: number }>
  >();
  let processed = 0; // 已处理的物品对数量
  for (const pairKey of candidatePairs.keys()) {
    /** 物品ID  */
    const [a, b] = pairKey.split("|").map(Number);
    /** 商品A的用户评分映射 */
    const mapA = itemUserMap.get(a);
    /** 商品B的用户评分映射 */
    const mapB = itemUserMap.get(b);
    if (!mapA || !mapB) continue;

    // 检查共同用户数
    let common = 0;
    for (const u of mapA.keys()) {
      if (mapB.has(u)) common++;
      if (common >= MIN_COMMON_USERS) break;
    }
    if (common < MIN_COMMON_USERS) continue;

    const sim = cosineSimilarity(mapA, mapB);
    if (sim <= 0) continue;

    // 双向添加
    if (!similarities.has(a)) similarities.set(a, []);
    if (!similarities.has(b)) similarities.set(b, []);
    similarities.get(a)!.push({ itemId: b, score: sim });
    similarities.get(b)!.push({ itemId: a, score: sim });

    processed++;
    if (processed % 5000 === 0) console.log(`Processed ${processed} pairs`);
  }

  // 排序并截取 TOP_K
  const final: Record<number, Array<{ itemId: number; score: number }>> = {};
  for (const [itemId, list] of similarities.entries()) {
    list.sort((x, y) => y.score - x.score);
    final[itemId] = list.slice(0, TOP_K);
  }
  console.log(
    `Final similarities computed for ${Object.keys(final).length} items`,
  );
  return final;
}

// ---------- 6. 打印结果（测试用）----------
async function saveSimilarities(similarityDict: Record<number, any[]>) {
  // 清空旧数据
  // await sql`TRUNCATE item_similarity`;

  // let total = 0;
  // for (const [itemId, simList] of Object.entries(similarityDict)) {
  //   for (let idx = 0; idx < simList.length; idx++) {
  //     const { itemId: simItem, score } = simList[idx];
  //     // 使用参数化查询（Neon 支持 $1 等占位符）
  //     await sql`
  //       INSERT INTO item_similarity (item_id, similar_item_id, similarity_score, rank)
  //       VALUES (${itemId}, ${simItem}, ${score}, ${idx + 1})
  //     `;
  //     total++;
  //   }
  // }
  // console.log(`Inserted ${total} similarity records.`);

  console.log("\n=== 计算结果 ===");
  console.log(JSON.stringify(similarityDict, null, 2));
}

// ---------- API 入口 ----------
export default defineEventHandler(async (event) => {
  // 可选：添加管理员权限验证（根据您的需求）
  // await checkToken(event);

  try {
    // 开始计算
    const start = Date.now();
    const similarities = await computeItemSimilarities();
    await saveSimilarities(similarities);
    const duration = (Date.now() - start) / 1000;

    return {
      success: true,
      message: `相似度计算完成，耗时 ${duration} 秒。`,
      itemCount: Object.keys(similarities).length,
    };
  } catch (error: any) {
    console.error("计算相似度失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: error.message,
    });
  }
});
