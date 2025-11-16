/**
 * 好友接口
 */
// 导入axios实例
import { useNuxtApp } from "#app";
// 获取axios实例的辅助函数
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};
/**
 * 搜索好友
 * @param params 搜索参数（包含分页和搜索选项）
 * @returns 好友列表及分页信息
 */
export async function searchFriends(
  params: SearchFriendsRequest
): Promise<SearchFriendsResponse> {
  console.log("搜索好友参数:", params);
  const axios = getAxios();
  const response = await axios.post<SearchFriendsResponse>(
    `/friends/search`,
    params
  );
  return response.data;
}

/**
 * 添加好友
 * @param data 添加好友请求数据
 * @returns 添加结果
 */
export async function addFriend(
  data: AddFriendRequest
): Promise<AddFriendResponse> {
  const axios = getAxios();
  const response = await axios.post<AddFriendResponse>(`/friends/add`, data);
  return response.data;
}

/**
 * 删除好友
 * @param data 删除好友请求数据
 * @returns 删除结果
 */
export async function deleteFriend(
  data: DeleteFriendRequest
): Promise<DeleteFriendResponse> {
  const axios = getAxios();
  // 调用删除好友接口server/api/friends/delete.ts
  // 删除好友时，需要传递好友ID
  // 接口会返回删除结果 类型为DeleteFriendResponse
  const response = await axios.delete<DeleteFriendResponse>(`/friends/delete`, {
    data,
  });
  return response.data;
}

/**
 * 获取好友聊天记录
 * @param params 获取好友聊天记录参数（包含好友ID和拉取聊天记录数量，开始时间，结束时间）
 * @returns 好友聊天记录列表
 */
export async function ChatRecords(
  params: ChatRecordsRequest
): Promise<ChatRecordsResponse> {
  const axios = getAxios();
  const response = await axios.post<ChatRecordsResponse>(
    `/friends/chatRecords`,
    params
  );
  return response.data;
}

// ==================== 类型声明 ====================

export interface ChatRecords {
  senderId: string; // 发送者ID
  receiverId: string; // 接收者ID
  content: string; // 聊天内容
  createdAt: string; // 创建时间
  seq: number; // 聊天记录序号 越大越新
}

export interface ChatRecordsResponse {
  success: boolean;
  message: string;
  list: ChatRecords[]; // 好友聊天记录列表
}

export interface ChatRecordsRequest {
  friendId: string; // 好友ID
  count: number; // 拉取聊天记录数量
  startTime?: string; // 开始时间（可选）
  endTime?: string; // 结束时间（可选）
}

// 分页参数接口
export interface PaginationParams {
  page: number; // 当前页码
  pageSize: number; // 每页条数
}

// 搜索选项接口
export interface SearchOptions {
  keyword: string; // 搜索关键词
  sortBy?: string; // 排序字段
  order?: "asc" | "desc"; // 排序方式
  status?: "online" | "offline" | "all"; // 好友状态
}

// 搜索好友参数接口（包含分页和选项）
export interface SearchFriendsRequest extends SearchOptions, PaginationParams {}

// 好友信息接口
export interface Friend {
  id: string; // 好友ID
  username: string; // 好友用户名
  avatar?: string; // 好友头像
  status: "online" | "offline";
  lastSeen?: string; // 最后活跃时间
  isFriend: boolean; // 是否是好友
}

// 搜索好友响应接口
export interface SearchFriendsResponse {
  list: Friend[]; // 好友列表
  total: number; // 总好友数
  page: number; // 当前页码
  pageSize: number; // 每页条数
  hasNext: boolean; // 是否有下一页
}

// 添加好友请求接口
export interface AddFriendRequest {
  friendId: string; // 要添加的好友ID
  message?: string; // 验证消息（可选）
}

// 添加好友响应接口
export interface AddFriendResponse {
  success: boolean;
  message: string;
  friendRequestId?: string; // 好友请求ID
}

// 删除好友请求接口
export interface DeleteFriendRequest {
  friendId: string; // 要删除的好友ID
}

// 删除好友响应接口
export interface DeleteFriendResponse {
  success: boolean;
  message: string;
}
