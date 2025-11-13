/**
 * 基于 nodemailer 的 QQ 邮箱 SMTP 发信模块
 * 供 Nuxt3 server/api 调用，0 成本发验证码
 */

// ① 载入发邮件核心库
import nodemailer from "nodemailer";

// ② 读取运行时配置（.env 里的 SMTP_*）
const config = useRuntimeConfig();
console.log("[Mail] 载入配置 ->", {
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  user: config.smtpUser,
});

// ③ 创建 SMTP 传输器（长连接，只登录一次）
const transporter = nodemailer.createTransport({
  host: config.smtpHost, // 主机名（SMTP 服务器地址）
  port: Number(config.smtpPort), // 端口号（465=true(SSL)；587=false(TLS)）
  secure: config.smtpSecure === "true", // 465=true(SSL)；587=false(TLS)
  auth: {
    // 认证信息（SMTP 登录账号密码）
    user: config.smtpUser, // 登录账号（完整邮箱地址）
    pass: config.smtpPass, // 登录密码（SMTP 授权码）
  },
});

// ④ 验证登录是否成功（打印一次即可）
transporter.verify((err, success) => {
  if (err) {
    console.error("[Mail] QQ SMTP 登录失败:", err);
  } else {
    console.log("[Mail] QQ SMTP 连接成功，可正常发信");
  }
});

/**
 * 发送邮件函数（异步）
 * @param {string} to      收件人邮箱
 * @param {string} subject 邮件标题
 * @param {string} html    邮件正文（支持 HTML）
 */
export async function sendQQMail(to, subject, html) {
  console.log("[Mail] 开始发送 ->", { to, subject });

  const info = await transporter.sendMail({
    from: `"注册系统" <${config.smtpUser}>`, // 必须和 SMTP_USER 一致，否则 553
    to,
    subject,
    html,
  });

  // ⑤ 打印关键结果
  console.log("[Mail] 发送完成 ✅ messageId:", info.messageId);
  return info;
}
