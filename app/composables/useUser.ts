// composables/useUser.ts
import { ref } from "vue";
import { useCookie } from "#app"; // Nuxt 3 内置，兼顾客户端/服务端读 Cookie

// 用户状态类型定义（保留原结构）
interface UserState {
  user_id: number; // 用户ID
  token: string; // 用户token
  expireTime: number; // token过期时间戳
}

// 核心调整：改为函数式导出（符合 Composables 规范，才能封装初始化逻辑）
export function useUser() {
  const userState = ref<UserState>({
    user_id: -1,
    token: "",
    expireTime: 0,
  });

  // 仅添加：刷新/首次加载时，从 Cookie 读取数据初始化状态
  const initUserState = () => {
    //从cookie中获取刷新token
    const token = useCookie("auth-token").value as string;
    if (!token) {
      return;
    }
    userState.value.user_id = Number(token.split(".")[0]) || -1;
    // 现在就可以读/写
    userState.value.token = token || "";
    userState.value.expireTime = Number(token.split(".")[1]);
  };

  initUserState();
  return userState; // 返回响应式状态
}

// 保留默认导出（兼容你可能的旧调用方式，可选删除）
export default useUser;
