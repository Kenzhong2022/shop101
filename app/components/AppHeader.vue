<template>
  <!-- 头部 -->
  <header class="bg-#ffff max-w-full h-65px flex flex-row justify-center">
    <!-- 导航栏容器 -->
    <nav class="w-full flex flex-1">
      <el-scrollbar class="h-100% flex-1 scrollbar-flex-content">
        <!-- 导航链接 -->
        <NuxtLink
          v-for="item in navList"
          :key="item.name"
          @click="handleNavClick(item)"
          class="no-underline flex-shrink-0 hover:cursor-pointer"
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
            <!-- 下拉菜单 -->
            <el-dropdown>
              <span class="el-dropdown-link"> </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Action 1</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </NuxtLink>
        <NuxtLink to="/train">
          <div
            class="text-[#333] transition-colors duration-300 flex items-center gap-2px text-[18px]"
          >
            <i
              class="iconfont icon-activity text-28px color-main"
              style="color: var(--el-color-primary)"
            ></i>
            <span class="hover:text-primary">训练场</span>
          </div>
        </NuxtLink>
      </el-scrollbar>
    </nav>
  </header>
  <!-- 搜索框 -->
</template>

<script setup>
// 传递字符串给父组件
const emit = defineEmits(["sendRoute"]);

const sendRoute = (msg) => {
  emit("sendRoute", msg);
};
const isActive = (item) => {
  const currentRoute = useRoute().path;
  // 当前item.path 为 / 则需要和当前路由完全相等
  if (item.path === "/") {
    return currentRoute === item.path;
  }
  // 其他情况：检查当前路由是否包含导航项的路径
  return currentRoute.includes(item.path);
};
// 默认导航配置
const navList = [
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
  { name: "登录/注册", path: "/login/myLogin", icon: "", showStickyTop: false },
];

// 导航点击处理
const handleNavClick = (navItem) => {
  // console.log("导航项点击:", navItem);
  if (navItem.isExternal) {
    // 外部链接：打开新页面
    window.open(navItem.path, "_blank");
  } else {
    console.log("导航项点击:", navItem);
    // 发送路由信息给父组件
    sendRoute(navItem);
    // 内部路由：用 Nuxt 路由跳转（原有逻辑）
    router.push(navItem.path);
  }
};

// 路由实例
const router = useRouter();

// 组件挂载时初始化
onMounted(() => {
  // 监听路由变化
  router.afterEach((to) => {
    console.log("AppHeader:当前路由:", to.path);
  });
});
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
