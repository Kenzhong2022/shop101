# JWT Cookie 设置实现详解

## 概述

本文档详细介绍 KKShop 项目中 **JWT（JSON Web Token）** 的 Cookie 设置机制，包括登录流程、Token 存储、自动携带、服务端验证等完整流程。

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              前端层                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  [登录页面] ──> [设置 Cookie/Storage] ──> [全局状态管理] ──> [Axios拦截器]  │
│    myLogin.vue        useCookie()         useUser()        自动携带Token    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP Request (Authorization: Bearer)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              服务端层                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [登录API] ──> [生成JWT] ──> [验证JWT] ──> [业务处理]                     │
│   login2.post    generateJWT()   verifyJWT()    requireAuth()            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 服务端：JWT 生成

**文件**: `server/api/login2.post.ts`

```typescript
// 验证用户身份后生成 JWT
const newToken = generateJWT({
  userId: user.id,
  email: user.email,
  username: user.username,
});

// 返回给前端
return {
  success: true,
  message: "登录成功",
  data: {
    token: newToken as string,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
    expiresIn: 60, // 60秒过期
  },
};
```

**JWT 生成配置**（`server/utils/auth.ts`）：

```typescript
const JWT_SECRET = process.env.JWT_SECRET || "abc123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1m"; // 1分钟
const JWT_ISSUER = "shop101-api";
const JWT_AUDIENCE = "shop101-client";

export function generateJWT(payload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud">): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}
```

---

## 2. 前端：Cookie 设置

### 2.1 登录成功后设置 Cookie

**文件**: `app/pages/login/myLogin.vue`

```typescript
const handleSubmit = async () => {
  // 调用登录 API
  const res = await login({ email, password });
  
  if (res.data?.token) {
    // ✅ 方式1：设置 Cookie
    useCookie("auth-token").value = res.data.token;
    
    // ✅ 方式2：同时设置 LocalStorage（双重保险）
    localStorage.setItem("token", res.data.token);
    
    // 更新全局用户状态
    updateUserState(res.data.token, res.data.user);
  }
};
```

### 2.2 Cookie 配置选项

**文件**: `app/composables/useUser.ts`

```typescript
const cookieOptions = {
  httpOnly: false,        // 允许前端 JavaScript 访问
  secure: process.env.NODE_ENV === "production",  // 生产环境启用 HTTPS
  sameSite: "lax" as const,  // 防止 CSRF 攻击
  maxAge: 60 * 60 * 24 * 7,  // 7天有效期
};
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `httpOnly` | `false` | 允许前端读取，便于状态同步 |
| `secure` | `production` | 生产环境强制 HTTPS |
| `sameSite` | `lax` | 限制跨站 Cookie 发送 |
| `maxAge` | `7天` | Cookie 持久化时间 |

---

## 3. 全局状态管理

**文件**: `app/composables/useUser.ts`

### 3.1 状态初始化

```typescript
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

    // 初始化时从 Cookie 读取 Token
    const initUserState = () => {
      if (process.server) return;  // 服务端不执行

      const token = useCookie<string | null>("auth-token").value;
      if (!token) return;

      // 解析 JWT payload
      const payload = parseJWT(token);
      if (payload) {
        globalUserState.value.userId = payload.userId || -1;
        globalUserState.value.token = token;
        globalUserState.value.expireTime = payload.exp ? payload.exp * 1000 : 0;
        globalUserState.value.user = {
          id: payload.userId,
          email: payload.email,
          username: payload.username,
          avatar: payload.avatar || "",
        };
        globalUserState.value.isLoggedIn = true;
      }
    };

    initUserState();
  }
  return globalUserState;
}
```

### 3.2 更新用户状态

```typescript
export const updateUserState = (token: string, user: SafeUser) => {
  // 1. 设置 Cookie
  useCookie("auth-token", cookieOptions).value = token;

  // 2. 解析 JWT 获取过期时间
  const payload = parseJWT(token);

  // 3. 更新全局状态
  const userState = useUser();
  userState.value.token = token;
  userState.value.userId = payload?.userId || -1;
  userState.value.avatar = user?.avatar || "";
  userState.value.isLoggedIn = true;
  userState.value.expireTime = payload?.exp ? payload.exp * 1000 : 0;
};
```

### 3.3 JWT 解析函数

```typescript
function parseJWT(token: string): JWTPayload | null {
  try {
    // JWT 格式: header.payload.signature
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Base64 解码并转 JSON
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
```

---

## 4. 请求拦截器：自动携带 Token

**文件**: `app/plugins/axios.ts`

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const axiosInstance = axios.create({
    baseURL: "/api",
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use((config) => {
    // 从 Cookie 获取 Token（仅客户端）
    if (process.client) {
      const token = useCookie("auth-token").value;
      if (token) {
        // 自动添加 Authorization 头
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("[Axios] 未找到 token");
      }
    }
    return config;
  });

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // 401 未授权处理
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  nuxtApp.provide("axios", axiosInstance);
});
```

---

## 5. 服务端：Token 验证

### 5.1 JWT 验证函数

**文件**: `server/utils/auth.ts`

```typescript
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error("[JWT验证失败]", error.message);
    
    if (error.name === "TokenExpiredError") {
      console.error("[JWT已过期]");
    } else if (error.name === "JsonWebTokenError") {
      console.error("[JWT签名不匹配]");
    }
    
    return null;
  }
}
```

### 5.2 认证中间件

```typescript
export async function requireAuth(event: H3Event) {
  // 从请求头获取 Token
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) {
    throw createError({ statusCode: 401, message: "未提供认证令牌" });
  }
  
  // 验证 Token
  const payload = verifyJWT(token);
  if (!payload) {
    throw createError({ statusCode: 401, message: "令牌无效或已过期" });
  }
  
  return { userId: payload.userId, payload };
}
```

### 5.3 使用示例

```typescript
// 在需要认证的 API 中使用
export default defineEventHandler(async (event) => {
  // 验证用户登录
  const { userId } = event.context.user;
  
  // 后续业务逻辑
  const data = await fetchUserData(userId);
  return data;
});
```

---

## 6. 登出：清除状态

```typescript
export const clearUserState = () => {
  // 清除 Cookie
  useCookie("auth-token").value = null;
  
  // 清除 LocalStorage
  localStorage.removeItem("token");

  // 重置全局状态
  const userState = useUser();
  userState.value.userId = -1;
  userState.value.token = "";
  userState.value.user = null;
  userState.value.isLoggedIn = false;
  userState.value.expireTime = 0;
};
```

---

## 完整流程时序图

```
用户                    前端                          服务端
  │                       │                            │
  │  提交登录表单          │                            │
  ├─────────────────────> │                            │
  │                       │                            │
  │                       │  POST /api/auth/login2      │
  │                       ├───────────────────────────> │
  │                       │                            │
  │                       │  验证密码并生成JWT          │
  │                       │                            │
  │                       │  返回 { token, user }      │
  │                       │<─────────────────────────── │
  │                       │                            │
  │                       │  设置 Cookie (auth-token)   │
  │                       │  更新全局状态               │
  │                       │                            │
  │                       │  后续请求自动携带Token      │
  │                       │                            │
  │                       │  GET /api/xxx              │
  │                       │  Header: Authorization     │
  │                       ├───────────────────────────> │
  │                       │                            │
  │                       │  verifyJWT(token)          │
  │                       │  requireAuth()             │
  │                       │                            │
  │                       │  返回业务数据               │
  │                       │<─────────────────────────── │
  │                       │                            │
```

---

## 安全特性

| 特性 | 实现方式 |
|------|----------|
| **防篡改** | JWT 签名验证，篡改后签名失效 |
| **过期控制** | JWT `exp` 声明，服务端校验 |
| **CSRF 防护** | `sameSite: lax` 限制跨站发送 |
| **HTTPS** | 生产环境 `secure: true` |
| **权限隔离** | 用户只能访问自己的数据 |

---

## Token 刷新机制（待完善）

当前 JWT 有效期为 1 分钟，需要实现刷新机制：

```typescript
// 建议的刷新流程
export async function refreshToken() {
  const userState = useUser();
  
  // 检测 Token 是否即将过期
  const timeRemaining = userState.value.expireTime - Date.now();
  if (timeRemaining > 60000) return; // 剩余超过1分钟不刷新
  
  try {
    // 请求刷新 Token
    const res = await $fetch("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken: userState.value.token },
    });
    
    // 更新 Token
    updateUserState(res.data.token, res.data.user);
  } catch (error) {
    // 刷新失败，跳转到登录页
    clearUserState();
    navigateTo("/login/myLogin");
  }
}
```

---

## 总结

项目的 JWT Cookie 设置实现了以下核心功能：

1. **登录生成**：服务端验证用户后生成 JWT
2. **双存储策略**：Cookie + LocalStorage 双重保障
3. **自动携带**：Axios 拦截器自动添加 Authorization 头
4. **全局状态**：useUser() 提供响应式登录状态管理
5. **自动恢复**：页面刷新时从 Cookie 自动恢复登录状态
6. **服务端验证**：requireAuth() 中间件统一验证
7. **登出清除**：完整清除所有认证信息
