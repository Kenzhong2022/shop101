// composables/useUser.ts
import type { MaybeRef } from "@vueuse/core";
import { ref, computed, unref, watchEffect, type Ref } from "vue";
import { useCookie } from "#app";

export interface UserState {
  user_id: number;
  token: string;
  expireTime: number;
}

/** 统一 cookie 配置，防止多实例不一致 */
const cookieOptions = {
  httpOnly: false, // 前端需要读写
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 天
};

// 全局共享的用户状态实例
let globalUserState: Ref<UserState> | null = null;

export function useUser() {
  // 如果全局实例不存在，创建它
  if (!globalUserState) {
    globalUserState = ref<UserState>({
      user_id: -1,
      token: "",
      expireTime: 0,
    });

    /** 只在客户端初始化一次 */
    const initUserState = () => {
      if (process.server) return;
      const token = useCookie<string | null>("auth-token").value;
      if (!token) return;

      const [uid, exp, sign] = token.split(".");
      console.log("打印参数", uid, exp, sign);
      globalUserState!.value.user_id = Number(uid) || -1;
      globalUserState!.value.token = token;
      globalUserState!.value.expireTime = Number(exp) || 0;
    };

    initUserState();
    /* 👇 一旦任何属性变化就打印 */
    if (process.client) {
      watchEffect(() => {
        console.log(">".repeat(20));
        console.log("[useUser] userState changed", {
          ...globalUserState!.value,
        });
        console.log("<".repeat(20));
      });
    }
  }

  return globalUserState;
}

/* ---------- 以下工具函数都使用全局状态 ---------- */

/** 检查用户是否已登录 */
export const isUserLoggedIn = () => {
  const userState = useUser();
  return computed(() => userState.value.user_id > 0);
};

/** 检查 token 是否过期（容忍 30 s 时钟偏移） */
export const isTokenExpired = () => {
  const userState = useUser();
  return computed(() => {
    const exp = userState.value.expireTime;
    if (!exp) return true;
    return Date.now() + 30_000 > exp; // 容忍 30 s 时钟偏移
  });
};

/** 更新用户状态（token 解析后写入 cookie 和响应式状态） */
export const updateUserState = (token: string) => {
  //字符串转数组，解析token
  const arr = token.split(".");
  if (arr.length !== 3) return;
  console.log("[updateUserState] 打印参数", arr);
  const [uid, exp, sign] = arr;
  if (!uid || !exp || !sign) return;

  const userState = useUser();

  // 先更新 cookie
  useCookie("auth-token").value = token;

  // 再更新全局状态
  useUser().value.user_id = Number(uid);
  useUser().value.token = token;
  useUser().value.expireTime = Number(exp);
};

/** 清除用户状态（cookie 和响应式状态） */
export const clearUserState = () => {
  const userState = useUser();

  // 清除 cookie
  useCookie("auth-token").value = null;

  // 重置全局状态
  userState.value.user_id = -1;
  userState.value.token = "";
  userState.value.expireTime = 0;

  console.log("[clearUserState] 用户状态已清除");
};

/** 获取当前用户信息（调试用） */
export const getCurrentUser = () => {
  const userState = useUser();
  return {
    user_id: userState.value.user_id,
    token: userState.value.token,
    expireTime: userState.value.expireTime,
    isLoggedIn: userState.value.user_id > 0,
    isExpired: userState.value.expireTime
      ? Date.now() > userState.value.expireTime
      : true,
  };
};
