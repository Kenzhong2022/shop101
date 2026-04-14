/** 分类表 */
export interface Category {
  id: number;
  name: string;
  created_at: string; // ISO 8601 格式
  parent_id: number | null; // null 表示一级分类
}

/** 分类树 */
export interface CategoryTree extends Category {
  children?: CategoryTree[];
}
