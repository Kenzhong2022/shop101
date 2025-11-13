import { getCode, store } from "../utils/codeStore";
import getNeon from "../utils/neon";
import bcrypt from "bcrypt";

interface RegisterBody {
  username: string;
  email: string;
  code: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

export default defineEventHandler(async (event) => {
  const { username, email, code, password } = await readBody<RegisterBody>(
    event
  );
  if (getCode(email) !== code)
    throw createError({ statusCode: 400, statusMessage: "验证码错误" });

  //连接数据库插入一条用户信息
  const mySql = getNeon();
  console.log("[Register] 数据库连接成功，准备注册用户:", username, email);
  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("[Register] 密码加密成功，加密后的密码:", hashedPassword);

  // 插入用户
  await mySql`
    INSERT INTO users (username, email, password)
    VALUES (${username}, ${email}, ${hashedPassword})
  `;

  // 验证码验证通过后，删除验证码
  store.delete(email);

  console.log("[Register] 用户注册成功:", email);
  // TODO：把 email + hash(password) 写数据库
  return { success: true, message: "注册成功" } as RegisterResponse;
});
