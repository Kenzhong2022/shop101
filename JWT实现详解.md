# 项目JWT实现详解

## 1. JWT结构

项目使用的标准JWT格式为三部分组成：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBzaG9wMTAxLmNvbSIsInVzZXJuYW1lIjoidXNlciIsImlzcyI6InNob3AxMDEtYXBpIiwiYXVkIjoic2hvcDEwMS1jbGllbnQiLCJpYXQiOjE3NzczMzE3NTEsImV4cCI6MTc3NzMzMTgxMX0.qSrl-9byZPN8qsPZNOTaDzfcVcNCv5GHdPgJVvtvq1w
     │                                                        │                                                          │
     │                                                        │                                                          └── Signature（签名）
     │                                                        └── Payload（载荷）
     └── Header（头部）
```

## 2. 核心配置

**文件**: `server/utils/auth.ts`

```typescript
const JWT_SECRET = process.env.JWT_SECRET || process.env.HMAC_SECRET_KEY || "abc123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1m";  // 1分钟过期
const JWT_ISSUER = "shop101-api";      // 发行者声明
const JWT_AUDIENCE = "shop101-client"; // 接收者声明
```

## 3. JWT生成

```typescript
// 生成标准JWT
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
    { expiresIn: JWT_EXPIRES_IN }  // 过期时间1分钟
  );
}
```

**Payload内容**（解码后）：
```json
{
  "userId": 1,
  "email": "user@shop101.com",
  "username": "user",
  "iss": "shop101-api",
  "aud": "shop101-client",
  "iat": 1777331751,
  "exp": 1777331811
}
```

## 4. JWT验证

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
    return null;
  }
}
```

## 5. 认证中间件

```typescript
export async function requireAuth(event: H3Event): Promise<{ userId: number; payload: JWTPayload }> {
  const token = getCookie(event, "auth-token");

  if (!token) {
    throw createError({ statusCode: 401, message: "用户未登录" });
  }

  const payload = verifyJWT(token);
  if (!payload) {
    throw createError({ statusCode: 401, message: "Token无效或已过期" });
  }

  return { userId: payload.userId, payload };
}
```

## 6. 登录流程

**文件**: `server/api/login2.post.ts`

```typescript
// 1. 验证用户密码
const isPasswordValid = await verifyPassword(password, user.password);

// 2. 生成JWT
const token = generateJWT({
  userId: user.id,
  email: user.email,
  username: user.username,
});

// 3. 返回给前端
return {
  success: true,
  data: {
    token: token,
    user: { id, email, username },
    expiresIn: 60  // 60秒
  }
};
```

## 7. 前端解析

**文件**: `app/composables/tools.js`

```typescript
function parseJWTExp(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
```

## 8. 路由守卫验证

**文件**: `app/middleware/auth.global.ts`

```typescript
if (to.meta?.pageInfo?.requiresAuth) {
  const token = useCookie("auth-token").value;
  if (!token) {
    return navigateTo("/login/myLogin?redirect=" + redirectPath);
  }
  if (!isExpired) {
    return navigateTo("/login/myLogin?redirect=" + redirectPath);
  }
}
```

## 9. 认证流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                          登录流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   前端                    后端                    数据库          │
│    │                      │                         │            │
│    │──POST /login2───────>│                         │            │
│    │                      │────查询用户─────────────>│            │
│    │                      │<───用户数据──────────────│            │
│    │                      │                         │            │
│    │                      │──bcrypt验证密码────────>│            │
│    │                      │                         │            │
│    │                      │──jwt.sign生成JWT───────>│            │
│    │                      │                         │            │
│    │<───{token}───────────│                         │            │
│    │                      │                         │            │
│    │──存储cookie──────────>│                         │            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        请求认证流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   前端                    后端                    数据库          │
│    │                      │                         │            │
│    │───请求API+cookie─────>│                         │            │
│    │                      │──getCookie获取token────>│            │
│    │                      │                         │            │
│    │                      │──jwt.verify验证────────>│            │
│    │                      │──检查exp/iss/aud──────>│            │
│    │                      │                         │            │
│    │<─────返回数据────────│                         │            │
│    │                      │                         │            │
└─────────────────────────────────────────────────────────────────┘
```

## 10. JWT vs Session对比

| 特性 | JWT | Session |
|------|-----|---------|
| 存储位置 | 客户端（Cookie/LocalStorage） | 服务端（内存/Redis） |
| 状态管理 | 无状态 | 有状态 |
| 扩展性 | 跨域友好 | 需分布式session |
| 过期处理 | 客户端验证+服务端黑名单 | 服务端直接失效 |
| 安全性 | 防篡改但可被窃取 | 服务端可控 |

## 11. 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `server/utils/auth.ts` | JWT核心工具函数（生成、验证、解析） |
| `server/api/login2.post.ts` | 登录接口，生成JWT |
| `app/composables/tools.js` | 前端JWT解析工具 |
| `app/composables/useUser.ts` | 用户状态管理 |
| `app/middleware/auth.global.ts` | 全局路由守卫 |
| `.env` | JWT环境变量配置 |
