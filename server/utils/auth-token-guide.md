# Token 认证机制详解

## Token 结构说明

Token 采用三段式结构，格式为：`uid.exp.sig`

```
uid.exp.sig
├── uid: 用户ID
├── exp: 过期时间戳（毫秒）
└── sig: HMAC签名
```

### 示例

```
12345.1703980800000.a1b2c3d4e5f6...
```

## 加密过程（生成 Token）

### 1. 准备数据

- **用户 ID** (`uid`): 用户的唯一标识符
- **过期时间** (`exp`): Unix 时间戳（毫秒），表示 Token 的过期时间
- **密钥** (`secret`): 用于 HMAC 签名的密钥，存储在环境变量中

### 2. 生成签名

使用 HMAC-SHA256 算法生成签名：

```javascript
const dataToSign = `${uid}.${exp}`;
const signature = crypto
  .createHmac("sha256", SECRET)
  .update(dataToSign)
  .digest("hex");
```

### 3. 组合 Token

将用户 ID、过期时间和签名用点号连接：

```javascript
const token = `${uid}.${exp}.${signature}`;
```

## 解密过程（验证 Token）

### 1. 解析 Token

首先将 Token 按点号分割成三部分：

```javascript
const [uid, exp, providedSig] = token.split(".");
```

### 2. 格式验证

检查是否包含所有必需的组成部分：

```javascript
if (!uid || !exp || !providedSig) {
  throw new Error("Token格式不正确");
}
```

### 3. 过期时间验证

检查 Token 是否已过期：

```javascript
if (Date.now() > Number(exp)) {
  throw new Error("Token已过期");
}
```

### 4. 签名验证

重新计算签名并与提供的签名进行比较：

```javascript
const dataToSign = `${uid}.${exp}`;
const expectedSig = crypto
  .createHmac("sha256", SECRET)
  .update(dataToSign)
  .digest("hex");

if (providedSig !== expectedSig) {
  throw new Error("签名验证失败");
}
```

## 安全特性

### 1. 防篡改

- HMAC 签名确保数据完整性
- 任何对 Token 内容的修改都会导致签名验证失败

### 2. 时序攻击防护

使用`crypto.timingSafeEqual()`进行签名比较，防止时序攻击：

```javascript
const expectedBuffer = Buffer.from(expectedSig, "hex");
const providedBuffer = Buffer.from(providedSig, "hex");
return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
```

### 3. 过期机制

- Token 包含过期时间戳
- 服务器会验证 Token 是否在有效期内
- 过期的 Token 将被拒绝

## 使用示例

### 生成 Token

```javascript
const uid = "12345";
const exp = String(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
const secret = process.env.HMAC_SECRET_KEY;

const token = generateLoginToken(uid, exp, secret);
// 结果: "12345.1703980800000.a1b2c3d4e5f6..."
```

### 验证 Token

```javascript
try {
  const userId = checkToken(token);
  console.log(`用户 ${userId} 验证成功`);
} catch (error) {
  console.error(`Token验证失败: ${error.message}`);
}
```

## 最佳实践

1. **密钥管理**: 使用强密钥并存储在环境变量中
2. **过期时间**: 设置合理的过期时间，平衡安全性和用户体验
3. **HTTPS**: 始终通过 HTTPS 传输 Token
4. **Token 刷新**: 实现 Token 刷新机制，避免频繁重新登录
5. **存储安全**: 在客户端安全存储 Token，避免 XSS 攻击

## 优缺点

### 优点

- 无状态：服务器不需要存储会话信息
- 可扩展：易于在分布式系统中使用
- 安全：HMAC 签名确保数据完整性

### 缺点

- 无法强制失效：Token 一旦签发，在过期前无法撤销
- 大小：比传统会话 ID 更大
- Payload 有限：URL 安全字符限制
