import { nanoid } from "nanoid";
import { setCode } from "../utils/codeStore";
import { sendQQMail } from "../utils/mail";

interface SendCodeBody {
  email: string;
}

interface SendCodeResponse {
  success: boolean;
  message: string;
}

export default defineEventHandler(async (event) => {
  // 第一步：获取前端传来的登录数据
  const { email } = await readBody<SendCodeBody>(event);
  // 第二步：参数验证
  if (!email) throw createError({ statusCode: 400, statusMessage: "邮箱必填" });
  // 验证邮箱格式
  if (
    /**
     * 邮箱格式验证正则表达式
     * 匹配规则：
     * - 用户名部分：可以包含字母、数字、下划线、点号和短横线 [a-zA-Z0-9_.-]+
     * - 域名部分：可以包含字母、数字和短横线 @[a-zA-Z0-9-]+
     * - 顶级域名：必须是 2 到 6 个字母 必须有一个点号
     */
    !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(
      email
    )
  ) {
    throw createError({ statusCode: 400, statusMessage: "邮箱格式错误" });
  }
  // 第三步：查询数据库验证用户是否已注册
  //   const [userRows] =
  //     await mySql`SELECT id FROM user WHERE email = ${email} LIMIT 1`;
  //   if (Array.isArray(userRows) && userRows.length > 0) {
  //     throw createError({ statusCode: 400, statusMessage: "邮箱已注册" });
  //   }
  // 第四步：发送验证码邮件
  const code = nanoid(6); // 6 位随机串
  // 存储验证码，有效期 5 分钟
  setCode(email, code, 5 * 60);

  // 发送验证码邮件 （生产环境请换成真实的注册链接）
  await sendQQMail(
    email,
    "注册验证码",
    `您的验证码是：<b style="color:#ff6600">${code}</b>，5 分钟内有效。`
  );

  return {
    success: true,
    message: "验证码已发送至 QQ 邮箱",
  } as SendCodeResponse;
});
