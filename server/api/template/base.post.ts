//====================接口请求/响应类型定义=========================
export interface RequestParams {
  // TODO: 根据具体业务需求定义请求参数
  page?: number; // 页码（可选）
  page_size?: number; // 每页数量（可选）
  [key: string]: any; // 允许添加其他字段
}

export interface ResponseData {
  // TODO: 根据具体业务需求定义响应数据结构
  id?: number; // 数据ID（可选）
  name?: string; // 名称（可选）
  [key: string]: any; // 允许添加其他字段
}

export interface ApiResponse {
  code: number; // 状态码
  msg: string; // 状态信息
  data: ResponseData | ResponseData[] | Record<string, any>; // 响应数据
}

//====================基础依赖导入=========================
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

/**
 * API接口基础骨架
 * TODO: 根据具体业务需求修改函数名称和逻辑
 */
export default defineEventHandler(async (event): Promise<ApiResponse> => {
  console.log("🔍 API接口被调用 ");

  try {
    // 1. 获取请求参数
    const body: RequestParams = await readBody(event);
    console.log("📋 接收到的请求参数:", body);

    // TODO: 参数默认值设置
    body.page = body.page || 1;
    body.page_size = body.page_size || 10;

    // 2. 参数验证
    // TODO: 根据业务需求添加参数验证
    if (!body /* 添加具体验证条件 */) {
      throw createError({
        statusCode: 400,
        message: "请求参数错误",
      });
    }

    // 3. 构建查询条件
    const cond = [];
    const values = [];

    // TODO: 根据业务需求添加查询条件
    if (body /* 添加具体条件 */) {
      cond.push(`字段名 = ?`);
      values.push(body.字段值);
    }

    // 4. 拼接WHERE子句
    const whereSql = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

    // 5. 计算分页偏移量
    const offset = (body.page - 1) * body.page_size;

    // 6. 执行数据库查询
    // TODO: 修改表名、字段名和查询逻辑
    const rows = await mySql`
      SELECT 
        id, 
        name, 
        created_at, 
        updated_at
      FROM 表名
      ${mySql.unsafe(whereSql)}
      ORDER BY created_at DESC
      LIMIT ${body.page_size} OFFSET ${offset}
    `;

    console.log("数据库查询结果:", rows);

    // 7. 返回成功响应
    return {
      code: 200,
      msg: "数据获取成功",
      data: {
        total: rows.length,
        list: rows,
      },
    } as ApiResponse;
  } catch (error) {
    // 8. 错误处理
    console.error("API处理错误:", error);

    return {
      code: 500,
      msg: `服务器错误: ${error}`,
      data: {},
    } as ApiResponse;
  }
});
