/** * 会员中心页面 * * 功能特点： * - 展示用户个人信息 * - 会员等级和积分系统 *
- 订单管理 * - 个人设置 * - 会员专属功能 */

<template>
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
        formatTime(useUser.expireTime, {
          format: "dateTime",
          dateSeparator: "-",
          timeSeparator: ":",
        })
      }}
    </h2>

    <!-- 页面头部 -->
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            >
              <span class="text-2xl">👤</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold">欢迎来到会员中心</h1>
              <p class="text-primary-100">管理您的个人信息和订单</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-primary-100">会员等级</div>
            <div class="text-lg font-semibold">黄金会员</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 会员统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="color-card text-center">
          <div class="text-3xl font-bold text-primary mb-2">1,250</div>
          <div class="text-sm text-gray-600">可用积分</div>
        </div>
        <div class="color-card text-center">
          <div class="text-3xl font-bold text-el-success mb-2">8</div>
          <div class="text-sm text-gray-600">待评价订单</div>
        </div>
        <div class="color-card text-center">
          <div class="text-3xl font-bold text-el-warning mb-2">3</div>
          <div class="text-sm text-gray-600">优惠券</div>
        </div>
      </div>

      <!-- 功能导航 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="color-card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="text-center p-6">
            <div class="text-3xl mb-3">📋</div>
            <h3 class="font-semibold text-gray-800 mb-2">我的订单</h3>
            <p class="text-sm text-gray-600">查看订单状态和历史记录</p>
          </div>
        </div>

        <div
          class="color-card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="text-center p-6">
            <div class="text-3xl mb-3">❤️</div>
            <h3 class="font-semibold text-gray-800 mb-2">我的收藏</h3>
            <p class="text-sm text-gray-600">管理收藏的商品</p>
          </div>
        </div>

        <div
          class="color-card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="text-center p-6">
            <div class="text-3xl mb-3">🎯</div>
            <h3 class="font-semibold text-gray-800 mb-2">积分商城</h3>
            <p class="text-sm text-gray-600">积分兑换商品</p>
          </div>
        </div>

        <div
          class="color-card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="text-center p-6">
            <div class="text-3xl mb-3">⚙️</div>
            <h3 class="font-semibold text-gray-800 mb-2">账户设置</h3>
            <p class="text-sm text-gray-600">修改个人信息</p>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="color-card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
        <div class="space-y-4">
          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-green-500">✅</span>
              <span class="text-sm">订单 #202412001 已完成</span>
            </div>
            <span class="text-xs text-gray-500">2小时前</span>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-blue-500">💰</span>
              <span class="text-sm">获得50积分奖励</span>
            </div>
            <span class="text-xs text-gray-500">1天前</span>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-orange-500">🎁</span>
              <span class="text-sm">领取了新优惠券</span>
            </div>
            <span class="text-xs text-gray-500">3天前</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制台测试信息 -->
    <div
      class="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-xs"
    >
      路由守卫已激活 - 查看控制台
    </div>
  </div>
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
  useUser.value.token = useCookie("auth-token").value as string;
  useUser.value.expireTime = Number(useUser.value.token.split(".")[1]);

  // 检查token是否过期
  // 使用composables中useUser的信息
  expTime.value = useUser.value.expireTime;
  console.log("token:", useUser.value.token);
  console.log("过期时间:", typeof useUser.value.expireTime);
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
    formatTime(useUser.value.expireTime, {
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
