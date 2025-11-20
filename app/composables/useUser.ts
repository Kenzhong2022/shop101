/**
 * 用户状态管理 Composable
 *
 * @使用说明
 *
 * 1. 基本使用方法：
 *    ```javascript
 *    // 在组件中导入和使用
 *    import { useUser } from '~/composables/useUser'
 *
 *    // 获取用户状态（响应式）
 *    const userState = useUser()
 *
 *    // 访问用户数据
 *    console.log('用户ID:', userState.value.user_id)
 *    console.log('Token:', userState.value.token)
 *    console.log('过期时间:', userState.value.expireTime)
 *    ```
 *
 * 2. 在模板中使用：
 *    ```vue
 *    <template>
 *      <div v-if="userState.user_id > 0">
 *        欢迎用户 {{ userState.user_id }}
 *      </div>
 *      <div v-else>
 *        请先登录
 *      </div>
 *    </template>
 *    ```
 *
 * 3. 更新用户状态：
 *    ```javascript
 *    // 登录成功后更新用户信息
 *    const handleLogin = (token) => {
 *      // 存储到 cookie
 *      useCookie('auth-token').value = token
 *
 *      // 更新用户状态
 *      userState.value.user_id = Number(token.split('.')[0])
 *      userState.value.token = token
 *      userState.value.expireTime = Number(token.split('.')[1])
 *    }
 *    ```
 *
 * 4. 检查登录状态：
 *    ```javascript
 *    // 检查是否已登录
 *    const isLoggedIn = computed(() => userState.value.user_id > 0)
 *
 *    // 检查 token 是否过期
 *    const isTokenExpired = computed(() => {
 *      return Date.now() > userState.value.expireTime
 *    })
 *    ```
 *
 * @注意
 * - 返回的是 ref 对象，需要通过 .value 访问和修改
 * - 用户状态会自动从 cookie 初始化
 * - token 格式："userId.expireTime.xxx"
 */

import { ref, computed } from "vue";
import { useCookie } from "#app"; // Nuxt 3 内置，兼顾客户端/服务端读 Cookie

// 用户状态类型定义（保留原结构）
interface UserState {
  user_id: number; // 用户ID
  token: string; // 用户token
  expireTime: number; // token过期时间戳
}

/**
 * 用户状态管理 Composable
 * @returns {Ref<UserState>} 响应式用户状态对象
 */
export function useUser() {
  const userState = ref<UserState>({
    user_id: -1,
    token: "",
    expireTime: 0,
  });

  /**
   * 从 cookie 初始化用户状态
   * token 格式：userId.expireTime.xxx
   */
  const initUserState = () => {
    const token = useCookie("auth-token").value as string;
    if (!token) {
      return;
    }

    try {
      const tokenParts = token.split(".");
      if (tokenParts.length >= 2) {
        userState.value.user_id = Number(tokenParts[0]) || -1;
        userState.value.token = token;
        userState.value.expireTime = Number(tokenParts[1]) || 0;
      }
    } catch (error) {
      console.error("解析 token 失败:", error);
      // token 解析失败时重置状态
      userState.value.user_id = -1;
      userState.value.token = "";
      userState.value.expireTime = 0;
    }
  };

  // 初始化用户状态
  initUserState();

  return userState;
}

/**
 * 检查用户是否已登录
 * @param userState - 用户状态对象
 * @returns {boolean} 是否已登录
 */
export const isUserLoggedIn = (userState: Ref<UserState>) => {
  return computed(() => userState.value.user_id > 0);
};

/**
 * 检查 token 是否过期
 * @param userState - 用户状态对象
 * @returns {boolean} 是否过期
 */
export const isTokenExpired = (userState: Ref<UserState>) => {
  return computed(() => {
    if (!userState.value.expireTime) return true;
    return Date.now() > userState.value.expireTime;
  });
};

/**
 * 更新用户状态（登录时使用）
 * @param userState - 用户状态对象
 * @param token - 用户 token
 */
export const updateUserState = (userState: Ref<UserState>, token: string) => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length >= 2) {
      // 先更新 cookie
      useCookie("auth-token").value = token;

      // 再更新状态
      userState.value.user_id = Number(tokenParts[0]) || -1;
      userState.value.token = token;
      userState.value.expireTime = Number(tokenParts[1]) || 0;
    }
  } catch (error) {
    console.error("更新用户状态失败:", error);
  }
};

/**
 * 清除用户状态（登出时使用）
 * @param userState - 用户状态对象
 */
export const clearUserState = (userState: Ref<UserState>) => {
  // 清除 cookie
  useCookie("auth-token").value = null;

  // 重置状态
  userState.value.user_id = -1;
  userState.value.token = "";
  userState.value.expireTime = 0;
};
