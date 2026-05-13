// server/tasks/refreshItemSimilarity.ts
import getNeon from "~~/server/utils/neon";

// 定义一个定时任务，由 Nuxt 的 task 系统调度（通常每日执行）
export default defineTask({
  meta: {
    name: "refresh-item-similarity",
    description: "每日基于 user_item_score 计算物品余弦相似度（单向存储）",
  },
  async run() {
    // 获取数据库连接（Neon serverless 驱动）
    const sql = getNeon();
    const startTime = Date.now();
    // 唯一锁ID，用于防止多个任务实例同时运行（例如在多个 serverless 函数并发时）
    const LOCK_ID = 2026042402;

    try {
      // 1. 尝试获取 PostgreSQL 咨询锁（advisory lock）
      // 如果成功返回 true，否则返回 false（其他实例已持有锁）
      const lockResult = await sql`SELECT pg_try_advisory_lock(${LOCK_ID})`;
      const isLocked = lockResult[0].pg_try_advisory_lock;

      if (!isLocked) {
        console.log("🚫 [物品相似度] 锁已被其他实例占用，跳过本次执行。");
        // 返回结果，标记 skipped，让调度器知道本次没有实际执行
        return { result: "success", updatedCount: 0, skipped: true };
      }

      console.log("🔒 [物品相似度] 成功获取排他锁，开始计算物品相似度...");

      // 2. 清空旧的相似度数据（全量刷新策略）
      // 使用 TRUNCATE 快速清空表，会重置所有行
      await sql`TRUNCATE item_similarity`;

      // 3. 核心计算：基于物品的评分向量计算余弦相似度
      const insertResult = await sql`
        WITH 
        -- 步骤 3.1: 提取每个物品在每个用户上的分数（只取 score > 0 的行）
        -- 作用：减少稀疏性，忽略负分（如果有）或未交互的零值
        item_vectors AS (
          SELECT 
            item_id,
            user_id,
            score
          FROM user_item_score
          WHERE score > 0   -- 只考虑正评分，缺失（未交互）不参与计算
        ),
        
        -- 步骤 3.2: 计算每对物品的点积和各自的 L2 范数（模长）
        -- 只针对有共同用户的物品对（通过 a.user_id = b.user_id 连接）
        -- 并且只保留 a.item_id < b.item_id，确保每对物品只计算一次（单向）
        item_pairs AS (
          SELECT 
            a.item_id AS item1,
            b.item_id AS item2,
            -- 点积：对所有共同用户的评分乘积后求和
            SUM(a.score * b.score) AS dot_product,
            -- 物品1的模：平方和开根号
            SQRT(SUM(a.score * a.score)) AS norm1,
            -- 物品2的模：平方和开根号
            SQRT(SUM(b.score * b.score)) AS norm2,
            -- 新增：统计共同用户数，用于过滤稀疏数据
            COUNT(DISTINCT a.user_id) AS common_users
          FROM item_vectors a
          INNER JOIN item_vectors b 
            ON a.user_id = b.user_id      -- 相同用户，确保有共现
            AND a.item_id < b.item_id     -- 单向，避免重复和自配对
          GROUP BY a.item_id, b.item_id   -- 按物品对分组聚合 也就是所有对这两个商品有过交互的用户
          HAVING COUNT(DISTINCT a.user_id) >= 2   -- 至少2个共同用户，避免单一用户导致的相似度=1
             AND SQRT(SUM(a.score * a.score)) > 0   -- 确保模不为零
             AND SQRT(SUM(b.score * b.score)) > 0   -- 避免除以零错误
        )
        
        -- 步骤 3.3: 插入计算结果到 item_similarity 表
        INSERT INTO item_similarity (item_id, similar_item_id, similarity_score)
        SELECT 
          item1,
          item2,
          -- 余弦相似度公式 = 点积 / (模1 × 模2)
          dot_product / (norm1 * norm2) AS similarity_score
        FROM item_pairs
        -- 可选：过滤掉相似度太低的物品对（例如 < 0.05），减少存储和后续计算
        WHERE dot_product / (norm1 * norm2) >= 0.05
      `;

      // 4. 统计插入的行数，用于日志输出
      const countResult = await sql`SELECT COUNT(*) FROM item_similarity`;
      const rowCount = Number(countResult[0].count);

      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `✅ [物品相似度] 计算完成，共 ${rowCount} 个物品对（单向），耗时 ${duration} 秒`,
      );

      // 返回成功，包含更新的行数和执行耗时
      return { result: "success", updatedCount: rowCount, duration };
    } catch (error) {
      console.error("💥 [物品相似度] 计算失败:", error);
      return { result: "error", error: String(error) };
    } finally {
      // 5. 释放咨询锁，使其他实例可以执行下一次任务
      try {
        await sql`SELECT pg_advisory_unlock(${LOCK_ID})`;
        console.log("🔓 [物品相似度] 已释放锁");
      } catch (unlockErr) {
        console.warn("⚠️ 释放锁时出错:", unlockErr);
      }
    }
  },
});
