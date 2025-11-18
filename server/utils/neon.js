// server/utils/neon.ts
import { neon } from "@neondatabase/serverless";

// 1. 用 Nuxt 官方方式读 env（自动导入，无需 import）
const { NUXT_NEON_DATABASE_URL } = useRuntimeConfig();

if (!NUXT_NEON_DATABASE_URL) {
  throw new Error("❌ 未配置 NUXT_NEON_DATABASE_URL 环境变量");
}

// 2. 导出 neon 客户端（保持原有的初始化逻辑）
const getNeon = () => neon(NUXT_NEON_DATABASE_URL);
const sql = getNeon();
export default getNeon;

// 3. 启动时自测（仅验证连接 + 列出所有表，简化逻辑）
(async () => {
  try {
    // 一、验证数据库连接成功（通过查询数据库版本）
    console.log("🔍 正在验证数据库连接...");
    console.log(
      "📊 数据库URL:",
      NUXT_NEON_DATABASE_URL.replace(/:(.*)@/, ":***@")
    ); // 脱敏显示连接信息

    const [{ version }] = await sql`SELECT version()`;
    console.log("✅ 数据库连接成功！");
    console.log(`📌 数据库版本: ${version.slice(0, 50)}...`);

    // 二、查询并列出所有表
    console.log("\n📋 数据库中存在的表（public Schema）:");
    const tables = await sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'  -- 仅显示用户表
        AND table_type = 'BASE TABLE'  -- 排除视图、临时表等
      ORDER BY table_name
    `;

    if (tables.length > 0) {
      console.log(`共发现 ${tables.length} 个表：`);
      tables.forEach((table, index) => {
        console.log(
          `  ${index + 1}. 表名：${table.table_name}（类型：${
            table.table_type
          }）`
        );
      });
    } else {
      console.log("⚠️ 当前数据库 public Schema 中暂无用户创建的表");
    }

    console.log("\n======================================");
  } catch (e) {
    console.error("\n❌ 数据库连接失败！");
    //数据库信息
    console.error("数据库URL:", NUXT_NEON_DATABASE_URL);
    console.error("错误信息:", e.message);
    console.error("======================================\n");
  }
})();
