// server/tasks/update-bayesian.ts
import getNeon from "~~/server/utils/neon";

export default defineTask({
  meta: {
    name: "update-bayesian",
    description: "批量计算商品贝叶斯评分",
  },
  async run() {
    const mySql = getNeon();
    const startTime = Date.now();
    const m = 10; // 最小阈值

    try {
      // 1. 获取全局平均分 C
      const globalRows = await mySql`
        SELECT AVG(rating) as avg_rating
        FROM goods_reviews 
        WHERE status = 1 AND is_show = 1
      `;
      const C = parseFloat(globalRows[0].avg_rating) || 3.0;
      // console.log(
      // "===================时间：",
      // new Date().toLocaleString() +
      // " 开始执行定时任务：update-bayesian=================",
      // );
      // console.log(`[Task] 全局平均分 C = ${C}`);
      // 2. 获取所有商品的评论统计
      const productRows = await mySql`
        SELECT 
          goods_id,
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM goods_reviews
        WHERE status = 1 AND is_show = 1
        GROUP BY goods_id
      `;
      // console.log("productRows:", productRows);
      // 3. 批量更新
      let updatedCount = 0;
      for (const product of productRows) {
        const R = parseFloat(product.avg_rating) || 0.0; // 商品平均分，默认0.0
        const v = parseInt(product.review_count) || 0; // 评论数，默认0
        const credibility = v / (v + m); // 评论数占比，默认0
        const bayesianScore = (R * credibility + C * (1 - credibility)).toFixed(
          2,
        );
        // console.log(
        //   `[Task] 商品 ${product.goods_id} 贝叶斯评分 = ${bayesianScore} (R=${R}, v=${v}, C=${C}, m=${m})`,
        // );
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
      // `[Task] 更新 ${updatedCount} 个商品，耗时 ${Date.now() - startTime}ms`,
      // );
      return { result: "success", updatedCount };
    } catch (error) {
      console.error("[Task] 批量计算失败:", error);
      return { result: "error", error: error.message };
    } finally {
      // console.log(
      //   "===================时间：",
      //   new Date().toLocaleString() +
      //     " 定时任务：update-bayesian 执行完成=================",
      // );
    }
  },
});
