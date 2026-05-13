// server/tasks/refreshUserItemScore.ts
import getNeon from "~~/server/utils/neon";

export default defineTask({
  meta: {
    name: "refresh-user-item-score",
    description: "每日刷新用户-物品综合评分（含时间衰减、停留时间、显式评分）",
  },
  async run() {
    const sql = getNeon();
    const startTime = Date.now();
    const LOCK_ID = 2026042401; // 唯一整数锁ID，避免与其他任务冲突

    try {
      // 1. 尝试获取咨询锁（防止多实例同时执行）
      const lockResult = await sql`SELECT pg_try_advisory_lock(${LOCK_ID})`;
      const isLocked = lockResult[0].pg_try_advisory_lock;

      if (!isLocked) {
        console.log("🚫 [定时任务] 锁已被其他实例占用，跳过本次执行。");
        return { result: "success", updatedCount: 0, skipped: true };
      }

      console.log("🔒 [定时任务] 成功获取排他锁，开始刷新 user_item_score...");

      // 2. 清空旧数据（全量刷新）
      await sql`TRUNCATE user_item_score`;

      // 3. 执行综合评分计算并插入新数据
      const insertResult = await sql`
        WITH config AS (
          SELECT 
            7.0 AS half_life_days, 
            300 AS max_duration, 
            2.0 AS explicit_multiplier, 
            0.02 AS duration_weight
        ),
        raw_scores AS (
          SELECT 
            user_id,
            item_id,
            CASE 
              -- 有显式评分：直接用评分 * 乘数
              WHEN explicit_rating IS NOT NULL THEN explicit_rating * explicit_multiplier
              -- 无显式评分，且是浏览行为（type=1）：基础权重 + 时长折算
              WHEN action_type = 1 THEN action_weight + duration_weight * LEAST(duration_seconds, max_duration)
              -- 无显式评分，其他隐式行为（如点击、购买等）：仅基础权重
              ELSE action_weight
            END AS base_strength,
            action_time
          FROM user_item_action, config
          WHERE action_time > NOW() - INTERVAL '90 days'
            AND user_id IS NOT NULL
        )
        INSERT INTO user_item_score (user_id, item_id, score, last_update)
        SELECT 
          user_id,
          item_id,
          SUM(base_strength * POW(2.0, - EXTRACT(EPOCH FROM (NOW() - action_time)) / (half_life_days * 86400))) AS score,
          NOW() AS last_update
        FROM raw_scores, config
        GROUP BY user_id, item_id
        ON CONFLICT (user_id, item_id) DO UPDATE SET 
          score = EXCLUDED.score,
          last_update = EXCLUDED.last_update;
      `;

      // 可选：获取插入/更新的行数（PostgreSQL 9.5+ 不直接返回，可单独查询计数）
      const countResult = await sql`SELECT COUNT(*) FROM user_item_score`;
      const rowCount = Number(countResult[0].count);

      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `✅ [定时任务] 刷新完成，共 ${rowCount} 条评分记录，耗时 ${duration} 秒`,
      );

      return { result: "success", updatedCount: rowCount, duration };
    } catch (error) {
      console.error("💥 [定时任务] 刷新 user_item_score 失败:", error);
      return { result: "error", error: String(error) };
    } finally {
      // 4. 释放锁
      try {
        await sql`SELECT pg_advisory_unlock(${LOCK_ID})`;
        console.log("🔓 [定时任务] 已释放锁");
      } catch (unlockErr) {
        console.warn("⚠️ 释放锁时出错:", unlockErr);
      }
    }
  },
});
