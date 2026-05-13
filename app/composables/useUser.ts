// app/composables/useUser.ts
import { ref, computed, watchEffect, type Ref } from "vue";
import { useCookie } from "#app";

export interface SafeUser {
  id: number;
  email: string;
  username: string;
  avatar: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  avatar?: string;
}

export interface UserState {
  userId: number;
  token: string;
  user: SafeUser | null;
  isLoggedIn: boolean;
  expireTime: number;
  avatar: string;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
};

let globalUserState: Ref<UserState> | null = null;

function parseJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url!.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useUser() {
  if (!globalUserState) {
    globalUserState = ref<UserState>({
      userId: -1,
      token: "",
      user: null,
      isLoggedIn: false,
      expireTime: 0,
      avatar: "",
    });

    const initUserState = () => {
      if (process.server) return;

      const token = useCookie<string | null>("auth-token").value;
      console.log(
        "[useUser] initUserState - token:",
        token ? `存在（长度: ${token.length}）` : "null",
      );

      if (!token) {
        console.log("[useUser] initUserState - 无token，返回");
        return;
      }

      const payload = parseJWT(token);
      console.log("[useUser] initUserState - payload:", payload);
      if (payload && payload.userId) {
        globalUserState!.value.userId = payload.userId || -1;
        globalUserState!.value.token = token;
        globalUserState!.value.expireTime = payload.exp
          ? payload.exp * 1000
          : 0;
        globalUserState!.value.user = {
          id: payload.userId,
          email: payload.email || "",
          username: payload.username || "",
          avatar: payload.avatar || "",
        };
        globalUserState!.value.isLoggedIn = true;
        console.log(
          "[useUser] initUserState - 用户状态初始化完成:",
          globalUserState!.value,
        );
      } else {
        console.log("[useUser] initUserState - JWT解析失败或userId为空");
      }
    };

    initUserState();

    if (process.client) {
      watchEffect(() => {
        console.log("[useUser] userState changed", {
          ...globalUserState!.value,
        });
      });
    }
  }

  return globalUserState;
}
/**
 * 检查用户是否已登录
 * @returns 用户是否已登录
 */
export const isUserLoggedIn = () => {
  const userState = useUser();
  return computed(() => userState.value.isLoggedIn);
};

/**
 * 检查 token 是否过期
 * @returns token 是否过期
 */
export const isTokenExpired = () => {
  const userState = useUser();
  return computed(() => {
    const exp = userState.value.expireTime;
    if (!exp) return true;
    return Date.now() > exp;
  });
};

/**
 * 更新用户状态
 * @param token 新的 token
 * @param user 新的用户信息
 */
export const updateUserState = (token: string, user: SafeUser) => {
  console.log("【updateUserState】开始更新用户状态");
  console.log(
    "【updateUserState】token:",
    token ? `已设置（长度: ${token.length}）` : "空",
  );
  console.log("【updateUserState】user:", user);
  /** 更新cookie中的token */
  useCookie("auth-token", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  }).value = token;

  const payload = parseJWT(token);
  console.log("【updateUserState】JWT payload:", payload?.userId);

  const userState = useUser();
  userState.value.token = token;
  userState.value.userId = payload?.userId || -1;
  userState.value.avatar = user?.avatar || "";
  userState.value.isLoggedIn = true;
  userState.value.expireTime = payload?.exp ? payload.exp * 1000 : 0;
  userState.value.user = user;

  console.log("【updateUserState】更新完成，用户状态:", userState.value);
};

export const clearUserState = () => {
  useCookie("auth-token").value = null;
  const userState = useUser();
  userState.value.userId = -1;
  userState.value.token = "";
  userState.value.user = null;
  userState.value.isLoggedIn = false;
  userState.value.expireTime = 0;
};

/**
 * 退出登录函数
 * 删除 cookie 中的 token 并清空用户状态
 */
export const logout = () => {
  console.log("【logout】用户退出登录");
  clearUserState();
  console.log("【logout】退出登录完成，用户状态已清空");
};

export const getCurrentUser = () => {
  const userState = useUser();
  return userState.value;
};
