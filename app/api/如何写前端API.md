# 前端 API 基础模板

## 基本结构

```typescript
// 1. 导入请求工具
import { useNuxtApp } from "#app";

// 2. 获取axios实例
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

// 3. 定义接口函数
export async function apiName(params: RequestType): Promise<ResponseType> {
  const axios = getAxios();
  const response = await axios.post<ResponseType>(`/api/path`, params);
  return response.data;
}

// 4. 类型定义
interface RequestType {
  // 请求参数
}

interface ResponseType {
  // 响应数据
}
```

## 请求方法示例

```typescript
// POST请求
export async function searchFriends(params: SearchRequest): Promise<SearchResponse> {
  const axios = getAxios();
  const response = await axios.post<SearchResponse>(`/friends/search`, params);
  return response.data;
}

// GET请求
export async function getUserInfo(id: string): Promise<UserInfo> {
  const axios = getAxios();
  const response = await axios.get<UserInfo>(`/user/info?id=${id}`);
  return response.data;
}

// PUT请求
export async function updateUser(data: UpdateRequest): Promise<UpdateResponse> {
  const axios = getAxios();
  const response = await axios.put<UpdateResponse>(`/user/update`, data);
  return response.data;
}

// DELETE请求
export async function deleteFriend(data: DeleteRequest): Promise<DeleteResponse> {
  const axios = getAxios();
  const response = await axios.delete<DeleteResponse>(`/friends/delete`, {
    data,
  });
  return response.data;
}
```

## 类型定义示例

```typescript
// 请求参数接口
export interface SearchRequest {
  keyword: string;
  page: number;
  pageSize: number;
}

// 响应数据接口
export interface SearchResponse {
  code: number;
  message: string;
  data: {
    list: any[];
    total: number;
  };
}

// 分页参数接口
export interface PaginationParams {
  page: number;
  pageSize: number;
}
```

## 错误处理

```typescript
export async function apiWithError(params: RequestType): Promise<ResponseType> {
  try {
    const axios = getAxios();
    const response = await axios.post<ResponseType>(`/api/path`, params);
    return response.data;
  } catch (error) {
    console.error("API错误:", error);
    throw error;
  }
}
```

## 完整示例

```typescript
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

// 类型定义
export interface SearchFriendsRequest extends SearchOptions, PaginationParams {}

export interface SearchFriendsResponse {
  list: Friend[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}
```