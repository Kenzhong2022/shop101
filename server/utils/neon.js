// server/utils/neon.ts
import { neon } from "@neondatabase/serverless";

// 1. 用 Nuxt 官方方式读 env（自动导入，无需 import）
const { NUXT_NEON_DATABASE_URL } = useRuntimeConfig();

if (!NUXT_NEON_DATABASE_URL) {
  throw new Error("❌ 未配置 NUXT_NEON_DATABASE_URL");
}

// 2. 导出“函数”而不是 pool，每次调用都返回一个 neon 客户端
export const getNeon = () => neon(NUXT_NEON_DATABASE_URL);

// 3. 启动时自测一次（仅服务端）
(async () => {
  try {
    const sql = getNeon();
    const [{ version }] = await sql`SELECT version()`;
    console.log("✅ Neon 连接成功", version.slice(0, 50) + "...");
  } catch (e) {
    console.error("❌ Neon 连接失败", e.message);
  }
})();
