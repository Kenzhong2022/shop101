/**
 * 内存型验证码存储工具（demo/毕业设计够用）
 * 上线后请换成 Redis 或数据库
 */

// ① 全局 Map 存验证码；服务重启即清空（生产环境请换成 Redis 或数据库）
export const store = new Map();

/**
 * ② 写入验证码并设置自动过期
 * @param {string} email 用户邮箱（当 key）
 * @param {string} code  6 位随机验证码
 * @param {number} ttl   有效期（秒），默认 5 分钟
 */
export const setCode = (email, code, ttl = 5 * 60) => {
  store.set(email, code);
  console.log(`[CodeStore] 已写入 ${email} -> ${code}，${ttl} 秒后自动删除`);

  // ttl 秒后删除，模拟“过期”
  setTimeout(() => {
    store.delete(email);
    console.log(`[CodeStore] 已过期/删除 ${email}`);
  }, ttl * 1000);
};

/**
 * ③ 读取验证码（用完即焚由调用方处理）
 * @param {string} email 用户邮箱
 * @returns {string|undefined} 验证码或 undefined
 */
export const getCode = (email) => {
  const code = store.get(email);
  console.log(`[CodeStore] 查询 ${email} -> ${code ?? "未找到"}`);
  return code;
};
