// 导入类型定义
import { Category, CategoryTree } from "~~/server/types/category";

// 导入数据库连接
import getNeon from "~~/server/utils/neon";
const mySql = getNeon();

export default defineEventHandler(async (event): Promise<CategoryTree[]> => {
  // 1. 获取请求参数
  const body = await readBody(event);
  console.log("📋 接收到的请求参数:", body);
  const { parent_id = null } = body;
  let categories;
  if (parent_id === null) {
    categories = await mySql`SELECT * FROM categories WHERE parent_id IS NULL;`;
  } else {
    categories =
      await mySql`SELECT * FROM categories WHERE parent_id = ${parent_id};`;
  }
  console.log("分类树:", categories);
  return categories as CategoryTree[];
});
