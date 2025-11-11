// // server/utils/neon.ts
// import { neon } from "@neondatabase/serverless";

// // 1. 用 Nuxt 官方方式读 env（自动导入，无需 import）
// const { NUXT_NEON_DATABASE_URL } = useRuntimeConfig();

// if (!NUXT_NEON_DATABASE_URL) {
//   throw new Error("❌ 未配置 NUXT_NEON_DATABASE_URL");
// }

// // 2. 导出“函数”而不是 pool，每次调用都返回一个 neon 客户端
// export const getNeon = () => neon(NUXT_NEON_DATABASE_URL);

// // 3. 启动时自测一次（仅服务端）
// (async () => {
//   try {
//     const sql = getNeon();
//     const [{ version }] = await sql`SELECT version()`;
//     console.log("✅ Neon 连接成功", version.slice(0, 50) + "...");
//   } catch (e) {
//     console.error("❌ Neon 连接失败", e.message);
//   }
// })();

/**
 * 最新方式：使用 @netlify/neon 库
 * 功能：启动时自动查询所有用户表 + 打印脱敏后的数据库配置信息
 */
import { neon } from "@netlify/neon";
import { URL } from "url"; // Node.js 内置模块，用于解析数据库 URL

// 1. 读取并解析数据库环境变量（核心配置信息）
const dbUrl =
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.NUXT_NEON_DATABASE_URL;

// 2. 打印脱敏后的数据库配置信息（安全不泄露密码）
function printDatabaseConfig() {
  console.log("======================================");
  console.log("📊 当前数据库配置信息（脱敏）");
  console.log("======================================");

  if (!dbUrl) {
    console.log("❌ 错误：未配置 NETLIFY_DATABASE_URL 环境变量");
    console.log("提示：请在 Netlify 项目/本地 .env 文件中配置该变量");
    console.log("======================================\n");
    return;
  }

  try {
    // 解析数据库 URL（格式：postgres://用户名:密码@主机:端口/数据库名）
    const parsedUrl = new URL(dbUrl);
    const username = parsedUrl.username;
    const host = parsedUrl.hostname; // 数据库主机
    const port = parsedUrl.port || 5432; // 默认 PostgreSQL 端口 5432
    const dbName = parsedUrl.pathname.slice(1); // 去掉路径开头的 "/"，得到数据库名

    // 脱敏打印（密码替换为 ***，避免泄露）
    console.log(`✅ 环境变量已配置：NETLIFY_DATABASE_URL`);
    console.log(`🔌 连接协议：${parsedUrl.protocol.slice(0, -1)}`); // 去掉末尾的 ":"
    console.log(`👤 用户名：${username || "默认"}`);
    console.log(`🔒 密码：***（已脱敏）`);
    console.log(`🌐 主机：${host}`);
    console.log(`⚡ 端口：${port}`);
    console.log(`🗄️  数据库名：${dbName}`);
  } catch (error) {
    console.log(
      "⚠️  数据库 URL 格式无效，原始值（脱敏）：",
      dbUrl.replace(/:(.*)@/, ":***@")
    );
    console.log("提示：URL 格式应为 postgres://用户名:密码@主机:端口/数据库名");
  }
  console.log("======================================\n");
}

// 3. 初始化数据库客户端（自动读取 NETLIFY_DATABASE_URL）
const sql = neon();

// 4. 查询所有用户表的函数（保持原有逻辑）
async function getAllUserTables() {
  try {
    console.log("🔍 开始查询 public Schema 下的所有用户表...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    // 处理结果
    const tableNames = tables.map((table) => table.table_name);
    console.log("✅ 查询成功！");
    console.log("📋 数据库中所有用户表：", tables);
    console.log(
      "📝 表名列表：",
      tableNames.length > 0 ? tableNames : "暂无用户创建的表"
    );
    console.log("\n======================================");

    return tableNames;
  } catch (error) {
    console.error("\n❌ 查询表失败：", error.message);
    console.error("详细错误栈：", error.stack);
    throw error; // 若需要终止程序，可改为 process.exit(1)
  }
}

// 5. 启动时自动执行（核心：立即执行异步函数）
(async function bootstrap() {
  // 第一步：打印配置信息
  printDatabaseConfig();

  // 若未配置数据库 URL，直接退出（避免后续查询报错）
  if (!dbUrl) {
    process.exit(1); // 非 0 状态码表示程序异常退出
  }

  // 第二步：自动查询所有表
  await getAllUserTables();
})();

export default sql;
