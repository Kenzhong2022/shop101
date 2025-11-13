import { getCode, store } from "../utils/codeStore";

interface RegisterBody {
  email: string;
  code: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

export default defineEventHandler(async (event) => {
  const { email, code, password } = await readBody<RegisterBody>(event);
  if (getCode(email) !== code)
    throw createError({ statusCode: 400, statusMessage: "验证码错误" });
  store.delete(email);

  // TODO：把 email + hash(password) 写数据库
  return { success: true, message: "注册成功" } as RegisterResponse;
});
