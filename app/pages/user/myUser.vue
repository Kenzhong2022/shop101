/** * 会员中心页面 * * 功能特点： * - 展示用户个人信息 * - 会员等级和积分系统 *
- 订单管理 * - 个人设置 * - 会员专属功能 */
<template>
  <client-only>
    <div class="user-container">
      <div class="shadow-md min-w-200px py-8px">
        <div class="flex flex-col items-center justify-center">
          <!-- 个人头像 -->
          <div>
            <el-avatar
              :src="userState.userInfo?.avatar"
              :size="100"
              class="my-avatar relative"
              @mouseenter="() => (isHovered = true)"
              @mouseleave="() => (isHovered = false)"
              :class="{ 'my-avatar-hover': isHovered }"
              @click="
                () => {
                  (fileInput as HTMLInputElement).click();
                }
              "
            />
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onSelect"
            />
          </div>
          <div class="text-center">KK个人中心</div>
        </div>
        <!-- 菜单：默认选中第一个 -->
        <el-menu class="menu-contaniner" :default-active="currentMenu">
          <kk-menu :menu-items="menuItems" />
        </el-menu>
      </div>
      <div class="flex-1">
        <el-card class="h-full relative mr-[20px]">
          <!-- 动态组件切换 -->
          <transition name="fade-slide" mode="out-in">
            <component
              :is="currentComponent"
              v-if="currentComponent"
              :data="data"
              @refresh="refreshCurrentComponent"
              :isLoading="loadingStore.isLoading"
            />
          </transition>
        </el-card>
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
definePageMeta({
  title: "个人中心",
  pageInfo: {
    requiresAuth: true,
    requiresAdmin: false,
  },
  layoutOptions: {
    showSearch: false,
    isStickyMode: false,
  },
});
import { userBehaviorProductsList } from "~/api/user-behavior/products";
import { useUser } from "~/composables/useUser";
import type { MenuItem } from "~/components/kk-menu.vue";
import type { Goods } from "~~/server/types/goods";
import { useLoadingStore } from "@/stores/loading";
// ========== 使用 markRaw 包裹异步组件，防止被代理 ==========
const MyUserInfo = markRaw(
  defineAsyncComponent(() => import("./myUserInfo.vue")),
);
const MyOrder = markRaw(defineAsyncComponent(() => import("./myOrder.vue")));
const MyCollect = markRaw(
  defineAsyncComponent(() => import("./myFavorites.vue")),
);
const MySetting = markRaw(
  defineAsyncComponent(() => import("./mySetting.vue")),
);
const MyHistory = markRaw(
  defineAsyncComponent(() => import("./myHistory.vue")),
);
const MyAddress = markRaw(
  defineAsyncComponent(() => import("./myAddress.vue")),
);
// ========== 使用 shallowRef 存储当前组件 ==========
const currentComponent = shallowRef<Component>(MyUserInfo);
// 当前选中的菜单
const currentMenu = ref<string>("/user/myUserInfo");
// 路由参数
const route = useRoute();
const router = useRouter();
// 动态组件的数据
const data = ref();
// 用户状态
const userState = useUser();
// 头像是否悬停状态
const isHovered = ref(false);
// 倒计时时间状态
const expTime = ref<number>(0);

const fileInput = ref<HTMLInputElement>();

interface CloudinaryUpload {
  file: Ref<File | null>;
  previewUrl: Ref<string>;
  resultUrl: Ref<string>;
  uploading: Ref<boolean>;
  selectFile: (file: File | null) => void;
  upload: () => Promise<void>;
}
const { file, previewUrl, resultUrl, uploading, selectFile, upload } =
  useCloudinary(true) as CloudinaryUpload;
// 处理文件选择 - 自动上传
async function onSelect(e: any) {
  const res = selectFile(e.target.files?.[0]);
  console.log("previewUrl:", res);
}

// ========== 1. 定义各组件的数据获取函数 ==========

// 历史记录
async function getHistoryList() {
  const { data: res } = await userBehaviorProductsList({
    page: 1,
    page_size: 10,
    action_type: 1,
  });
  data.value = Array.isArray(res.GoodsItems)
    ? res.GoodsItems.map((item) => ({ ...item, isChecked: false }))
    : [];
}

// 收藏夹
async function getFavoritesList() {
  const { data: res } = await userBehaviorProductsList({
    page: 1,
    page_size: 10,
    action_type: 2,
  });
  data.value = Array.isArray(res.GoodsItems)
    ? res.GoodsItems.map((item) => ({ ...item, isChecked: false }))
    : [];
}

// ========== 2. 组件配置表：每个组件绑定自己的数据和刷新函数 ==========
interface ComponentConfig {
  component: Component;
  fetchData: () => Promise<void>;
  title: string;
  icon: string;
}
/**
 * 组件配置表：每个组件绑定自己的数据和刷新函数
 */
const componentConfigMap: Record<string, ComponentConfig> = {
  "/user/myUserInfo": {
    component: MyUserInfo,
    fetchData: async () => {
      /* 个人信息可能不需要刷新 */
    },
    title: "个人信息",
    icon: "icon-yonghu-copy",
  },
  "/user/myOrder": {
    component: MyOrder,
    fetchData: async () => {
      /* 暂时没有 */
    },
    title: "订单记录",
    icon: "icon-dingdan",
  },
  "/user/myCollect": {
    component: MyCollect,
    fetchData: getFavoritesList,
    title: "收藏夹",
    icon: "icon-collection",
  },
  "/user/myHistory": {
    component: MyHistory,
    fetchData: getHistoryList,
    title: "浏览历史",
    icon: "icon-lishijilu_o",
  },
  "/user/mySetting": {
    component: MySetting,
    fetchData: async () => {
      /* 设置页可能不需要 */
    },
    title: "账号设置",
    icon: "icon-setting-copy",
  },
  "/user/myAddress": {
    component: MyAddress,
    fetchData: async () => {
      /* 地址管理页可能不需要 */
    },
    title: "地址管理",
    icon: "icon-dizhi",
  },
};

// ========== 3. 统一的刷新函数（根据当前组件动态调用）=========
/**
 * 当前组件的刷新函数
 */
const currentRefreshFn = ref<(() => Promise<void>) | null>(null);

const loadingStore = useLoadingStore();

// 统一的刷新入口
/**
 * 刷新当前组件的数据
 */
async function refreshCurrentComponent() {
  if (currentRefreshFn.value) {
    try {
      // isLoading.value = true;
      await currentRefreshFn.value(); // 刷新数据
    } catch (error) {
      console.error("刷新数据失败:", error);
    } finally {
      // isLoading.value = false;
    }
  }
}
/**
 * 根据 tab 参数获取对应的组件和刷新函数
 * @param tab 菜单路径
 */
async function updateComponentByTab(tab: string) {
  // 处理 tab 值格式，确保与 componentConfigMap 键匹配
  let normalizedTab = tab;
  if (tab && !tab.startsWith("/user/")) {
    normalizedTab = `/user/${tab}`;
  }
  const config = componentConfigMap[normalizedTab];
  currentMenu.value = normalizedTab;
  if (config) {
    currentRefreshFn.value = config.fetchData;
    try {
      // isLoading.value = true;
      await config.fetchData(); // 刷新数据
      currentComponent.value = config.component;
    } catch (error) {
      console.error("刷新数据失败:", error);
    } finally {
      // isLoading.value = false;
    }
  } else {
    console.warn(`未找到对应的组件配置: ${tab}`);
    // 默认显示个人信息页
    const defaultConfig = componentConfigMap["/user/myUserInfo"];
    if (defaultConfig) {
      currentMenu.value = "/user/myUserInfo";
      currentRefreshFn.value = defaultConfig.fetchData;
      await defaultConfig.fetchData();
      currentComponent.value = defaultConfig.component;
    }
  }
}
// 自动生成菜单项的工厂函数
/**
 * 创建菜单项
 * @param url 菜单路径
 * @returns 菜单项
 */
function createMenuItem(url: keyof typeof componentConfigMap): MenuItem {
  const config = componentConfigMap[url]; // 获取组件配置
  if (!config) {
    throw new Error(`未找到对应的配置: ${url}`);
  }
  return {
    title: config.title,
    url,
    icon: config.icon,
    /**
     * 点击菜单时，切换组件并刷新数据
     * @param item 菜单项
     */
    onClick: async (item: MenuItem) => {
      // 设置路由参数为当前点击的菜单
      router.push({ query: { tab: item.url } });
      currentRefreshFn.value = config.fetchData;
      try {
        await config.fetchData();
      } catch (error) {
        console.error("刷新数据失败:", error);
      } finally {
        // 切换当前组件
        currentComponent.value = config.component;
      }
    },
  };
}

/**
 * 菜单项配置
 */
const menuItems: MenuItem[] = [
  createMenuItem("/user/myUserInfo"),
  createMenuItem("/user/myOrder"),
  createMenuItem("/user/myCollect"),
  createMenuItem("/user/myHistory"),
  createMenuItem("/user/myAddress"),
  createMenuItem("/user/mySetting"),
];

// 页面加载完成后的操作
onMounted(() => {
  expTime.value = userState.value.expireTime;
  updateComponentByTab(route.query.tab as string); // 默认个人信息
});
// 监听路由变化
watch(
  () => route.query,
  async (newTab) => {
    console.log("页面激活时重置状态", newTab);
    await updateComponentByTab(newTab.tab as string); // 默认个人信息
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.user-container {
  display: flex !important;
  gap: 20px;
}

.menu-contaniner {
  :deep(.el-menu-item) {
    margin: 10px !important;
    border-radius: 12px;
    box-sizing: border-box;
  }
  :deep(.el-menu-item.is-active) {
    background-color: var(--el-color-primary-light-9) !important;
  }
  :deep(.el-sub-menu__title) {
    margin: 10px !important;
    border-radius: 12px;
    box-sizing: border-box;
  }
}

:deep(.el-tabs__item.is-active) {
  font-weight: 700;
}

.my-avatar-hover::after {
  content: "\e610";
  font-family: "iconfont";
  font-size: 24px; /* 控制大小 */
  text-align: center;
  line-height: 100px;
  color: rgba(255, 255, 255, 0.8); /* 图标颜色 */
  display: block;
  position: absolute;
  cursor: pointer;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  width: 100px;
  height: 100px;
  /* 图标 32×32 居中 */
  background: rgba(0, 0, 0, 0.5);
}
</style>
