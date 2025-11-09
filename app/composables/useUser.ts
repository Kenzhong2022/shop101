// 保存和用户相关的信息
import { ref } from "vue";

// 用户状态类型定义
interface UserState {
  token: string; // 用户token
  expireTime: number; // token过期时间戳
}

// 创建带有类型的用户状态ref
export const useUser = ref<UserState>({
  token: "", // 用户token
  expireTime: 0, // token过期时间
});
