/**
 * 页面刷新时，重新获取token
 */

import { updateUserState } from "~/composables/useUser";
export default defineNuxtPlugin(async () => {
  // 监听页面刷新事件
  console.log("🔄 页面刷新时调用,刷新用户信息");
  const token = useCookie("auth-token").value ?? "";
  updateUserState(token);
});
