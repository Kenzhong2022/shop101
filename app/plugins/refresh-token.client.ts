/**
 * 页面刷新时，重新获取token
 */

import initUserState from "~/composables/useUser";
import { useUser } from "~/composables/useUser";
const userState = useUser();
export default defineNuxtPlugin(async () => {
  // 监听页面刷新事件
  console.log("🔄 页面刷新时调用");
  console.log("用户状态>>>>>>>>>>>>>>>>>>>>:", userState.value);
  initUserState();
  console.log("用户状态>>>>>>>>>>>>>>>>>>>>:", userState.value);
});
