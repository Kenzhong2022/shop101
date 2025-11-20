/**
 * useUser 组合式函数使用示例
 * 改进版本 - 全局单例模式
 */

import {
  useUser,
  isUserLoggedIn,
  isTokenExpired,
  updateUserState,
  clearUserState,
  getCurrentUser,
} from "./useUser";

// 示例 1: 基本使用 - 获取用户状态
export function example1() {
  const userState = useUser();

  // 在模板中可以直接使用 userState
  console.log("当前用户ID:", userState.value.user_id);
  console.log("当前token:", userState.value.token);
  console.log("过期时间:", userState.value.expireTime);
}

// 示例 2: 使用辅助函数
export function example2() {
  const userState = useUser();

  // 检查登录状态
  const loggedIn = isUserLoggedIn();
  const expired = isTokenExpired();

  console.log("是否已登录:", loggedIn.value);
  console.log("token是否过期:", expired.value);

  // 更新用户状态（登录后）
  updateUserState("123.456.signature");

  // 清除用户状态（退出登录）
  clearUserState();

  // 获取当前用户信息（调试用）
  const currentUser = getCurrentUser();
  console.log("当前用户信息:", currentUser);
}

// 示例 3: 在组件中使用
export function example3() {
  // 在组件的 setup() 中
  const userState = useUser();

  // 监听用户状态变化
  watchEffect(() => {
    console.log("用户状态变化:", userState.value.user_id);
  });

  // 在模板中使用
  // <template>
  //   <div v-if="userState.user_id > 0">
  //     欢迎，用户 {{ userState.user_id }}
  //   </div>
  //   <div v-else>
  //     请先登录
  //   </div>
  // </template>
}

// 示例 4: 在登录页面中使用
export async function example4() {
  const userState = useUser();

  // 登录成功后
  const token = "123.456.signature"; // 从API获取的token
  updateUserState(token);

  // 检查是否登录成功
  if (isUserLoggedIn().value) {
    console.log("登录成功！");
    // 跳转到首页
    await navigateTo("/");
  }
}

// 示例 5: 在API请求中使用
export function example5() {
  const userState = useUser();

  // 获取用户信息
  async function getUserInfo() {
    if (!isUserLoggedIn().value) {
      console.log("用户未登录");
      return null;
    }

    // 使用token进行API请求
    const response = await $fetch("/api/user/info", {
      headers: {
        Authorization: `Bearer ${userState.value.token}`,
      },
    });

    return response;
  }

  return { getUserInfo };
}

// 示例 7: 调试全局状态
export function debugGlobalState() {
  console.log("=== 全局用户状态调试 ===");

  // 获取当前状态
  const currentUser = getCurrentUser();
  console.log("当前用户信息:", currentUser);

  // 测试状态更新
  console.log("\n--- 测试状态更新 ---");
  updateUserState("999.1234567890.signature");

  const afterUpdate = getCurrentUser();
  console.log("更新后用户信息:", afterUpdate);

  // 测试状态清除
  console.log("\n--- 测试状态清除 ---");
  clearUserState();

  const afterClear = getCurrentUser();
  console.log("清除后用户信息:", afterClear);

  console.log("=== 调试结束 ===");
}
