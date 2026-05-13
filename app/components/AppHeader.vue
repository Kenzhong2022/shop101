<template>
  <!-- 头部 -->
  <header class="bg-#ffff max-w-full h-65px flex flex-row justify-center">
    <!-- 导航栏容器 -->
    <nav class="w-full">
      <!-- 父盒子宽度根据子元素宽度自适应 -->
      <el-scrollbar class="h-100%">
        <!-- 导航链接 -->
        <NuxtLink
          v-for="(item, index) in navList"
          :key="item.name"
          @click="handleNavClick(item)"
          class="no-underline flex-shrink-0 hover:cursor-pointer"
          :class="{
            'ml-auto': index === navList.length - 1 && item.name == '登录/注册',
          }"
        >
          <div
            class="text-[#333] transition-colors duration-300 flex items-center gap-2px text-[18px]"
          >
            <!-- 根据导航项名称使用对应的阿里图标 -->
            <i
              :class="['iconfont', item.icon, 'text-28px', 'color-main']"
              :style="{
                color:
                  item.icon === 'icon-cart-empty'
                    ? 'var(--el-color-primary)'
                    : '#333',
              }"
            ></i>
            <!-- 导航项名称 -->
            <span
              class="hover:text-primary"
              :style="{
                color: isActive(item) ? 'var(--el-color-primary)' : '#333',
              }"
              >{{ item.name }}
            </span>
          </div>
        </NuxtLink>
        <span class="ml-auto" v-if="userState?.user?.email">
          <!-- 头像 -->
          已登录{{ maskEmail(userState?.user?.email) }}
          <!-- 下拉菜单 -->
          <el-dropdown>
            <span class="el-dropdown-link cursor-pointer flex items-center">
              <el-icon class="el-icon--right ml-1">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 个人中心 -->
                <el-dropdown-item>个人中心</el-dropdown-item>
                <!-- 账号设置 -->
                <el-dropdown-item>账号设置</el-dropdown-item>
                <!-- 我的订单 -->
                <el-dropdown-item>我的订单</el-dropdown-item>
                <!-- 我的收藏 -->
                <el-dropdown-item>我的收藏</el-dropdown-item>
                <!-- 分隔线 -->
                <el-dropdown-item divided></el-dropdown-item>
                <!-- 登出（最常用）跳转登录页 -->
                <el-dropdown-item class="text-red-500" @click="handleLogout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </el-scrollbar>
    </nav>
  </header>
  <!-- 搜索框 -->
</template>

<script setup>
import { ArrowDown } from "@element-plus/icons-vue";
import { logout } from "@/composables/useUser";
// 路由实例
const router = useRouter();
// 组件挂载时初始化
onMounted(() => {});
// 用户状态
const userState = useUser();

// 邮箱脱敏函数
function maskEmail(email) {
  if (!email) return "";
  // QQ邮箱正则匹配
  const qqEmailRegex = /^(\d{1,2})\d*@qq\.com$/;
  const match = email.match(qqEmailRegex);
  if (match) {
    // 保留前1-2位数字，中间用*代替
    return `${match[1]}****@qq.com`;
  }
  // 非QQ邮箱也做简单脱敏处理
  const generalRegex = /^(\w{1,2})\w*@(\w+\.\w+)$/;
  const generalMatch = email.match(generalRegex);
  if (generalMatch) {
    return `${generalMatch[1]}****@${generalMatch[2]}`;
  }
  return email;
}
function isActive(item) {
  const currentRoute = useRoute().path;
  // 当前item.path 为 / 则需要和当前路由完全相等
  if (item.path === "/") {
    return currentRoute === item.path;
  }
  // 其他情况：检查当前路由是否包含导航项的路径
  return currentRoute.includes(item.path);
}
// 当登录后需要筛选出登录相关导航项，否则显示登录/注册导航项
const navList = computed(() => {
  const temp = [
    { name: "首页", path: "/", icon: "icon-home" },
    { name: "用户中心", path: "/user/myUser", icon: "icon-yonghu" },
    {
      name: "活动中心",
      path: "https://gym-nuxt3.netlify.app/",
      icon: "icon-activity",
      isExternal: true,
    }, // 外部链接标记
    { name: "购物车", path: "/cart/myCart", icon: "icon-cart-empty" },
    { name: "分类", path: "/category", icon: "icon-category" },
    { name: "帮助中心", path: "/help", icon: "icon-remind-fill" },
    { name: "训练场", path: "/train", icon: "icon-activity" }, // 加到这里
    {
      name: "登录/注册",
      path: "/login/myLogin",
      icon: "",
      showStickyTop: false,
    },
  ];
  if (userState.value?.user) {
    console.log(
      123123,
      temp.filter((item) => item.name !== "登录/注册"),
    );
    return temp.filter((item) => item.name !== "登录/注册");
  }
  return temp;
});

// 导航点击处理
function handleNavClick(navItem) {
  if (navItem.isExternal) {
    // 外部链接：打开新页面
    window.open(navItem.path, "_blank");
  } else {
    console.log(navItem);
    router.push(navItem.path);
  }
}

// 在组件中调用
const handleLogout = () => {
  logout();
  navigateTo("/login/myLogin");
};
</script>

<style scoped lang="scss">
:deep(.el-scrollbar__view) {
  padding: 0 20px;
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;

  /* 基础间距（中等屏幕） */
  gap: 20px;

  /* 大屏（容器宽度>1200px）：间距放大 */
  @media (min-width: 1200px) {
    gap: 24px;
  }

  /* 小屏（容器宽度<768px）：间距缩小 */
  @media (max-width: 768px) {
    gap: 8px;
  }
  height: 100% !important;
  .scrollbar-flex-content {
    width: fit-content;
    height: 100%;
  }
}
</style>
