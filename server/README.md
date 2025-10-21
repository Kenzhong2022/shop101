# Server 文件夹使用指南

## 📁 文件夹结构

```
server/
├── api/                    # API 路由文件夹
│   └── auth/              # 认证相关API
│       └── login.post.ts  # 登录接口（POST请求）
└── README.md              # 本文档
```

## 🚀 什么是 Server 文件夹？

`server/` 文件夹是 Nuxt 3 的服务器端代码存放位置，基于 **Nitro** 服务器引擎。这里面的文件会自动变成 API 接口，无需额外配置路由。

## 📝 API 文件命名规则

### 命名格式

```
[名称].[方法].[扩展名]
```

- **名称**：API 的路径名称（支持多级路径）
- **方法**：HTTP 请求方法（get, post, put, delete, patch）
- **扩展名**：文件类型（ts, js, mjs）

### 示例

```
login.post.ts        → 访问路径：/api/auth/login
user.get.ts          → 访问路径：/api/user
profile.put.ts       → 访问路径：/api/profile
```

### 多级路径示例

```
server/api/user/profile.get.ts    → 访问路径：/api/user/profile
server/api/admin/users.post.ts    → 访问路径：/api/admin/users
```

## 🔧 基本 API 文件结构

```typescript
// 请求数据接口（可选）
interface RequestData {
  // 定义请求体数据结构
}

// 响应数据接口（推荐）
interface ResponseData {
  success: boolean;
  message: string;
  data?: any; // 可选的具体数据
}

// API 处理函数（默认导出）
export default defineEventHandler(async (event): Promise<ResponseData> => {
  try {
    // 1. 获取请求数据
    const body = await readBody<RequestData>(event);

    // 2. 处理业务逻辑
    // ... 你的代码 ...

    // 3. 返回响应
    return {
      success: true,
      message: "操作成功",
      data: {
        /* 返回的数据 */
      },
    };
  } catch (error) {
    // 错误处理
    console.error("API错误:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
```

## 🛠️ 常用工具函数

### 1. 读取请求体

```typescript
const body = await readBody(event); // 读取 JSON 数据
const query = getQuery(event); // 获取 URL 查询参数
const params = getRouterParams(event); // 获取路由参数
```

### 2. 设置响应头

```typescript
setHeader(event, "Content-Type", "application/json");
setCookie(event, "name", "value", { httpOnly: true });
```

### 3. 错误处理

```typescript
// 抛出错误（会自动返回对应的HTTP状态码）
throw createError({
  statusCode: 400, // HTTP状态码
  statusMessage: "错误信息",
});
```

### 4. 获取请求头

```typescript
const authHeader = getHeader(event, "authorization");
```

## ⚠️ 重要注意事项和坑

### ❌ 千万不要做的事情

1. **不要使用相对路径导入**

   ```typescript
   // ❌ 错误
   import { something } from "../utils/helper";

   // ✅ 正确 - 使用别名或绝对路径
   import { something } from "~/server/utils/helper";
   ```

2. **不要在 API 中使用 `res.send()` 或 `res.json()`**

   ```typescript
   // ❌ 错误 - 这是 Express 的写法
   res.json({ message: "hello" });

   // ✅ 正确 - 直接 return
   return { message: "hello" };
   ```

3. **不要忘记处理异步错误**

   ```typescript
   // ❌ 错误
   export default defineEventHandler(async (event) => {
     const data = await fetchData(); // 如果这里报错，不会被捕获
     return data;
   });

   // ✅ 正确 - 使用 try-catch
   export default defineEventHandler(async (event) => {
     try {
       const data = await fetchData();
       return data;
     } catch (error) {
       throw createError({ statusCode: 500, statusMessage: "获取数据失败" });
     }
   });
   ```

### ⚠️ 需要特别注意的事情

1. **文件命名要严格遵循规则**

   - `login.get.ts` 只能处理 GET 请求
   - `login.post.ts` 只能处理 POST 请求
   - 如果写错了方法名，API 不会生效

2. **错误处理要完整**

   ```typescript
   // 推荐的错误处理模板
   } catch (error: any) {
     // 检查是否是我们主动抛出的错误
     const nitroError = error as { statusCode?: number };
     if (nitroError?.statusCode) {
       throw error; // 直接抛出已定义的错误
     }

     // 处理未预料的错误
     console.error('API错误:', error);
     throw createError({
       statusCode: 500,
       statusMessage: '服务器内部错误'
     });
   }
   ```

3. **类型安全很重要**

   ```typescript
   // 为请求和响应定义接口
   interface LoginRequest {
     email: string;
     password: string;
   }

   interface LoginResponse {
     success: boolean;
     token: string;
   }

   export default defineEventHandler(async (event): Promise<LoginResponse> => {
     const body = await readBody<LoginRequest>(event);
     // ...
   });
   ```

4. **环境变量使用**
   ```typescript
   // 获取环境变量
   const apiKey = process.env.API_KEY;
   const isDev = process.env.NODE_ENV === "development";
   ```

## 🎯 最佳实践建议

### 1. 统一的响应格式

```typescript
// 成功响应
{
  success: true,
  message: '操作成功',
  data: { /* 具体数据 */ }
}

// 错误响应（自动由Nitro处理）
{
  url: '/api/login',
  statusCode: 401,
  statusMessage: '邮箱或密码错误',
  message: '邮箱或密码错误',
  stack: '<错误堆栈>'
}
```

### 2. 参数验证

```typescript
// 始终验证输入参数
if (!email || !password) {
  throw createError({
    statusCode: 400,
    statusMessage: "邮箱和密码不能为空",
  });
}
```

### 3. 日志记录

```typescript
// 记录重要操作和错误
console.log("用户登录:", email);
console.error("登录失败:", error);
```

### 4. 安全性考虑

```typescript
// 不要返回敏感信息
return {
  success: true,
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    // ❌ 不要返回: password, salt 等敏感字段
  },
};
```

## 🚀 调试技巧

1. **查看控制台输出**

   - 服务器日志会显示在终端中
   - 使用 `console.log()` 进行调试

2. **测试 API**

   - 使用 Postman 或 curl 测试
   - 访问 `/api/你的接口路径`

3. **查看错误信息**
   - 开发模式下会显示详细的错误堆栈
   - 生产模式下只显示友好的错误信息

## 📚 相关资源

- [Nitro 文档](https://nitro.unjs.io/)
- [Nuxt 3 服务器文档](https://nuxt.com/docs/guide/directory-structure/server)
- [HTTP 状态码参考](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)

---

💡 **记住**：Server 文件夹的文件会自动变成 API，命名要规范，错误要处理，安全要考虑！
