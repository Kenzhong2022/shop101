// // server/utils/db.ts
// import mysql from "mysql2/promise";

// // 获取 .env 中的数据库配置（Nuxt 3 专属：useRuntimeConfig）
// const config = useRuntimeConfig();
// console.log("数据库配置：", {
//   port: config.DB_PORT,
//   host: config.DB_HOST,
//   user: config.DB_USER,
//   database: config.DB_NAME,
// });

// // 创建 MySQL 连接池
// const pool = mysql.createPool({
//   host: config.DB_HOST,
//   user: config.DB_USER,
//   password: config.DB_PASSWORD,
//   database: config.DB_NAME,
//   port: Number(config.DB_PORT),
//   charset: "utf8mb4", // 支持中文/emoji
//   waitForConnections: true,
//   connectionLimit: 10, // 最大连接数
//   queueLimit: 0,
// });

// // 测试数据库连接（可选，启动时验证）
// async function testDbConnection() {
//   try {
//     const connection = await pool.getConnection(); // 正确：直接接收单个连接对象
//     console.log("✅ MySQL 数据库连接成功（shop101）");
//     connection.release(); // 释放连接回池
//   } catch (err) {
//     console.error("❌ MySQL 数据库连接失败：", err.message);
//   }
// }

// // 执行测试（服务端启动时运行）
// testDbConnection();

// // 导出连接池（供其他服务端接口复用）
// export default pool;

// server/utils/neon.ts（Neon PostgreSQL 专属连接工具，TS 格式）
import { neon } from "@neondatabase/serverless";
// 关键修改：替换 #app 导入为 Nitro 服务端专属导入
import { useRuntimeConfig } from "nitropack/runtime"; // 重点替换这行！

// 获取 Nuxt3 运行时配置（读取 .env 中的 Neon 变量）
const config = useRuntimeConfig();

// 验证 Neon 连接串是否存在（避免启动报错）
if (!config.NUXT_NEON_DATABASE_URL) {
  throw new Error("❌ 未配置 NUXT_NEON_DATABASE_URL，请检查 .env 文件");
}

// 创建 Neon 连接实例（适配 PostgreSQL）
const pool = neon(config.NUXT_NEON_DATABASE_URL);

// 测试 Neon 连接（和 MySQL 测试逻辑一致，启动时验证）
async function testNeonConnection() {
  try {
    // 执行简单查询（查询 PostgreSQL 版本）
    const result = await pool`SELECT version()`;
    console.log("✅ Neon PostgreSQL 连接成功！");
    console.log("PostgreSQL 版本：", result[0].version.slice(0, 50) + "...");
  } catch (err) {
    console.error("❌ Neon PostgreSQL 连接失败：", err.message);
  }
}

// 启动时执行测试（仅服务端运行）
testNeonConnection();

// 导出 Neon 连接实例（供服务端 API/组件调用）
export default pool;
