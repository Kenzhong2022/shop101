# 后端 API 基础模板

## 基本结构

```typescript
// 1. 定义接口
interface RequestData {
  // 请求参数
}

interface ResponseData {
  // 响应数据
}

// 2. 数据库连接
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

// 3. 主函数
export default defineEventHandler(async (event) => {
  // 获取参数
  const body = await readBody(event);

  // 查询数据库
  const result = await mySql`SELECT * FROM table WHERE id = ${body.id}`;

  // 返回结果
  return {
    code: 200,
    data: result,
  };
});
```

## 数据库查询示例

```typescript
// 查询单条
const item = await mySql`SELECT * FROM goods WHERE id = ${id}`;

// 查询列表
const list = await mySql`SELECT * FROM goods LIMIT 10`;

// 条件查询
const result = await mySql`
  SELECT * FROM goods 
  WHERE shop_name = ${shop_name} 
  AND is_show = 1
`;

// 插入数据
const insert = await mySql`
  INSERT INTO goods (name, price) 
  VALUES (${name}, ${price})
`;

// 更新数据
const update = await mySql`
  UPDATE goods SET price = ${price} 
  WHERE id = ${id}
`;
```

## 错误处理

```typescript
try {
  const result = await mySql`SELECT * FROM goods`;
  return { code: 200, data: result };
} catch (error) {
  return { code: 500, msg: "数据库错误" };
}
```
