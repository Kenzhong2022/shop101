// server/utils/db.ts
import mysql from "mysql2/promise";

// 获取 .env 中的数据库配置（Nuxt 3 专属：useRuntimeConfig）
const config = useRuntimeConfig();
console.log("数据库配置：", {
  port: config.DB_PORT,
  host: config.DB_HOST,
  user: config.DB_USER,
  database: config.DB_NAME,
});

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: Number(config.DB_PORT),
  charset: "utf8mb4", // 支持中文/emoji
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0,
});

// 测试数据库连接（可选，启动时验证）
async function testDbConnection() {
  try {
    const connection = await pool.getConnection(); // 正确：直接接收单个连接对象
    console.log("✅ MySQL 数据库连接成功（shop101）");
    connection.release(); // 释放连接回池
  } catch (err) {
    console.error("❌ MySQL 数据库连接失败：", err.message);
  }
}

// 执行测试（服务端启动时运行）
testDbConnection();

// 导出连接池（供其他服务端接口复用）
export default pool;
