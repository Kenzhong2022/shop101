// 搜索好友接口
// 对应前端: POST /friends/search
import getNeon from "~~/server/utils/neon";
// import { checkToken } from "~~/server/utils/auth";
const mySql = getNeon();
// 分页参数接口
interface PaginationParams {
  page: number; // 当前页码
  pageSize: number; // 每页条数
}

// 搜索选项接口
interface SearchOptions {
  keyword: string; // 搜索关键词
  sortBy?: string; // 排序字段
  order?: "asc" | "desc"; // 排序方式
  status?: "online" | "offline" | "all"; // 好友状态
  userId: number; // 用户ID
}

// 搜索好友参数接口（包含分页和选项）
interface SearchFriendsRequest extends SearchOptions, PaginationParams {}

// 好友信息接口
interface Friend {
  id: string; // 好友ID
  username: string; // 好友用户名
  avatar?: string; // 好友头像
  status: "online" | "offline";
  lastSeen?: string; // 最后活跃时间
  isFriend: boolean; // 是否是好友
}

// 搜索好友响应接口
interface SearchFriendsResponse {
  list: Friend[]; // 好友列表
  total: number; // 总好友数
  page: number; // 当前页码
  pageSize: number; // 每页条数
  hasNext: boolean; // 是否有下一页
}

export default defineEventHandler(
  async (event): Promise<SearchFriendsResponse> => {
    console.log("🔍 搜索好友接口被调用 ");

    try {
      // 获取请求体参数（POST请求使用readBody）
      const body: SearchFriendsRequest = await readBody(event);
      console.log("📋 接收到的请求体参数:", body);

      // 解析搜索参数
      const {
        keyword = "",
        page = 1,
        pageSize = 5,
        status = "all",
        sortBy = "username",
        order = "asc",
        userId = 0,
      } = body;
      console.log("📝 搜索参数:", {
        keyword,
        page,
        pageSize,
        status,
        sortBy,
        order,
        userId, //排除自己
      });

      const offset = (page - 1) * pageSize; // 计算偏移量
      const searchKeyword = `%${keyword}%`; // 模糊搜索关键词

      console.log(
        `🔍 准备执行SQL查询 - 关键词: SELECT * FROM (SELECT * FROM users WHERE id not in (${userId}))  WHERE username LIKE ${searchKeyword}`
      );
      let rows: Friend[] = [];
      if (keyword) {
        rows = (await mySql`
      SELECT * FROM users WHERE id not in (${userId}) AND username LIKE ${searchKeyword}
    `) as Friend[];
        console.log("🔍 执行SQL查询结果:", rows[0]);
      } else {
        rows = (await mySql`
        SELECT * FROM users WHERE id not in (${userId}) 
      `) as Friend[];
        console.log(
          "🔍 执行SQL查询结果:",
          rows.map((row) => row.username)
        );
      }
      return {
        list: rows as Friend[],
        total: rows.length,
        page,
        pageSize,
        hasNext: rows.length >= pageSize,
      };
    } catch (error) {
      console.error("❌ 搜索好友接口调用失败:", error);
      throw error;
    }
  }
);
