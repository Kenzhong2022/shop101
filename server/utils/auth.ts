import crypto from "node:crypto";
const SECRET = "abc123";

// 检查 token 是否有效
export function checkToken(token: string): number {
  // token 格式：uid.exp.sig （uid 为用户 id，exp 为过期时间戳，sig 为签名）
  const [uid, exp, sig] = token.split(".");
  if (!uid || !exp || !sig) throw new Error("格式不对");

  if (Date.now() > Number(exp)) throw new Error("已过期");

  // 验证签名
  const expect = crypto
    .createHmac("sha256", SECRET) // 创建 HMAC 实例，使用 SHA-256 算法和密钥 SECRET
    .update(`${uid}.${exp}`) // 更新 HMAC 实例，添加 uid 和 exp 字符串
    .digest("hex"); // 计算签名并转换为十六进制字符串

  if (sig !== expect) throw new Error("签名错");

  return Number(uid); // 返回用户 id
}
