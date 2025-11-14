<template>
  <div class="w-95% mx-auto overflow-hidden setBgc b-solid">
    <div
      class="flex flex-col min-h-screen w-100% max-w-[1600px] mx-auto bg-#fff shadow-md relative"
    >
      <!-- 页面跳转进度条组件 -->

      <!-- 这是头部通用组件 -->
      <!-- 传递信息给子组件 -->
      <AppHeader
        @sendRoute="handleChangeByRoute"
        class="bg-white max-w-[1200px] shadow-sm h-65px"
        :msg="msg"
      />
      <!-- 吸顶搜索 -->
      <stickyTop class="w-100%" v-if="showStickyTop" />
      <!-- 嵌套内容布局 - 将页面内容传递给 content 布局 -->
      <div class="flex gap-10 mx-auto w-100% max-w-[1600px]">
        <!-- 侧边栏：通过状态控制是否显示 -->
        <NuxtLayout
          v-if="showMenu"
          name="menu"
          class="bg-red max-w-[200px] min-w-[200px]"
        ></NuxtLayout>

        <!-- 插槽：当使用default布局时 这个地方页面的内容 -->
        <div class="flex-1 bg-white rounded-lg shadow-sm w-100%">
          <NuxtPage
            :keepalive="{
              max: 10, // 最多缓存 10 个页面实例
              exclude: [''], // 不排除任何页面（可添加页面路由名称来排除特定页面）
            }"
          ></NuxtPage>
        </div>
      </div>

      <!-- 这是底部通用组件 -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
interface routeItem {
  name: string;
  path: string;
  showStickyTop?: boolean;
}

const msg = "hello world";
const showMenu = ref(false);
const showStickyTop = ref(true);
// 接收来自子组件的路由信息
function handleChangeByRoute(route: routeItem) {
  console.log("顶部导航改变了：", route);
  // console.log("route.path", route.path, route.path == "/category");
  showMenu.value = route.path === "/category";
  // 如果路由配置了 showStickyTop，使用它；否则默认 true
  showStickyTop.value = route?.showStickyTop ?? true;
}
const route = useRoute();

/**
 * 截取路径中的第一个层级（格式：/[第一个层级]）
 * @param path 输入路径（如 /category/style/japanese）
 * @returns 第一个层级（如 /category）
 */
const getFirstRouteLevel = (path: string): string => {
  // 兼容异常路径：空路径或非 / 开头，直接返回原路径
  if (!path || !path.startsWith("/")) return path;

  // 找第二个 / 的位置（从第一个 / 后面开始找）
  const secondSlashIndex = path.indexOf("/", 1);

  // 有第二个 / → 截到该位置；没有 → 整个路径就是第一个层级
  return secondSlashIndex > 0 ? path.slice(0, secondSlashIndex) : path;
};
onMounted(() => {
  console.log("当前路由", route);
  showMenu.value = getFirstRouteLevel(route.path) === "/category";
  console.log(route.path, showMenu.value, showStickyTop.value);
});
</script>

<style scoped></style>
