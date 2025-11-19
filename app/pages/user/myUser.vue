/** * 会员中心页面 * * 功能特点： * - 展示用户个人信息 * - 会员等级和积分系统 *
- 订单管理 * - 个人设置 * - 会员专属功能 */

<template>
  <el-card shadow="never">
    <div class="min-h-screen bg-gray-50">
      <!-- 倒计时组件:显示token的有效时间 -->
      <h2>
        还有
        <el-countdown
          :value="expTime"
          format="HH:mm:ss"
          :auto-start="true"
          @finish="handleTokenExpire"
        />
        token就会过期
      </h2>
      <h2>
        过期时间为：{{
          formatTime(userState.expireTime, {
            format: "dateTime",
            dateSeparator: "-",
            timeSeparator: ":",
          })
        }}
      </h2>
    </div>
  </el-card>
</template>

<script setup lang="ts">
// 页面元信息配置
// 这里可以添加更多路由元信息，用于路由守卫判断
definePageMeta({
  title: "用户中心",
  layout: "default",
  pageInfo: {
    requiresAuth: true, // 标记需要认证
    pageType: "user-center", // 页面类型
  },
});

import { useUser } from "~/composables/useUser";
const userState = useUser(); // 关键：加括号调用
import formatTime from "~/composables/tools";

const expTime = ref<number>(0);

// 页面加载完成后的操作
onMounted(() => {
  console.log("🎉 会员中心页面已加载完成");
  console.log("📱 当前页面: 用户中心");
  // 可以在这里添加更多页面初始化逻辑
  // 例如：加载用户数据、获取会员信息等
});

onActivated(() => {
  console.log("页面激活时调用");
  // 重新获取cookie中的token
  userState.value.token = useCookie("auth-token").value as string;
  userState.value.expireTime = Number(userState.value.token.split(".")[1]);

  // 检查token是否过期
  // 使用composables中useUser的信息
  expTime.value = userState.value.expireTime;
  console.log("token:", userState.value.token);
  console.log("过期时间:", typeof userState.value.expireTime);
  let t = new Date().getTime();
  console.log(
    "当前时间:",
    formatTime(t, {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    })
  );
  console.log(
    "过期时间格式化:",
    formatTime(userState.value.expireTime, {
      format: "dateTime",
      dateSeparator: "-",
      timeSeparator: ":",
    })
  );
});

// 处理token过期
function handleTokenExpire() {
  console.log("token已过期");
  // 清除过期的token
  // localStorage.removeItem("token");
  // 跳转到登录页面
  navigateTo("/login/myLogin");
}
</script>

<style lang="scss" scoped>
// 可以在这里添加页面特定的样式
.color-card {
  @apply p-4 rounded-lg shadow-sm border border-gray-200 bg-white;
}
</style>
