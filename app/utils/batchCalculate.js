// utils/batchCalculate.js
//====================建立数据库连接=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * 定时任务：批量计算所有商品的贝叶斯评分
 * 建议每5分钟执行一次，或用 node-cron 定时
 */
async function batchUpdateBayesianScores() {
  // console.log("开始批量计算贝叶斯评分...");
  const startTime = Date.now();

  try {
    // 1. 获取全局平均分 C
    const globalRows = await mySql`
      SELECT AVG(rating) as C 
      FROM goods_reviews 
      WHERE status = 1 AND is_show = 1
    `;
    const C = parseFloat(globalRows[0].C) || 3.0;
    const m = 10; // 最小阈值

    // 2. 获取所有商品的评论统计
    const productRows = await mySql`
      SELECT 
        goods_id,
        AVG(rating) as R,
        COUNT(*) as v
      FROM goods_reviews
      WHERE status = 1 AND is_show = 1
      GROUP BY goods_id
    `;

    // 3. 批量更新
    let updatedCount = 0;
    for (const product of productRows) {
      const R = parseFloat(product.R);
      const v = parseInt(product.v);

      // 计算贝叶斯评分
      const credibility = v / (v + m);
      const bayesianScore = (R * credibility + C * (1 - credibility)).toFixed(
        2,
      );

      // 更新商品表
      await mySql`
        UPDATE homepage_goods 
        SET 
          average_rating = ${bayesianScore},
          review_count = ${v},
          updated_at = NOW()
        WHERE id = ${product.goods_id}
      `;

      updatedCount++;
    }

    // console.log(
    //   `批量更新完成: ${updatedCount} 个商品, 耗时 ${Date.now() - startTime}ms`,
    // );
    return { success: true, updatedCount };
  } catch (error) {
    // console.error("批量计算失败:", error);
    // return { success: false, error: error.message };
  }
}

// 导出定时任务
export { batchUpdateBayesianScores };

// 使用 node-cron 每5分钟执行一次（需要单独执行）
// import cron from 'node-cron';
// cron.schedule("*/5 * * * *", batchUpdateBayesianScores);
