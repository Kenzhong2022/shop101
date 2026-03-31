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
});
import { apihistoryProductsList } from "~/api/history/products";
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
// 组件映射表
const componentMap: Record<string, Component> = {
  "/user/myUserInfo": MyUserInfo,
  "/user/myOrder": MyOrder,
  "/user/myCollect": MyCollect,
  "/user/mySetting": MySetting,
  "/user/myHistory": MyHistory,
  "/user/myAddress": MyAddress,
};
const route = useRoute();
const router = useRouter();
// 动态组件的数据
const data = ref();

const userState = useUser();

// 头像是否悬停状态
const isHovered = ref(false);

// 倒计时时间状态
const expTime = ref<number>(0);

// 页面加载完成后的操作
onMounted(() => {
  console.log("页面加载完成后的操作", route.query.tab);
  expTime.value = userState.value.expireTime;
  updateComponentByTab((route.query.tab as string) || "/user/myUserInfo"); // 默认个人信息
});
// ========== 核心：页面激活时重置状态 ==========
onActivated(() => {
  console.log("页面激活时重置状态", route.query.tab);
  updateComponentByTab((route.query.tab as string) || "/user/myUserInfo"); // 默认个人信息
});
// 根据 tab 参数获取对应的组件和刷新函数
async function updateComponentByTab(tab: string) {
  const config = componentConfigMap[`${tab}`]; // 注意 key 格式要与配置一致
  currentMenu.value = `${tab}`;
  if (config) {
    currentComponent.value = config.component;
    currentRefreshFn.value = config.fetchData;
    try {
      // isLoading.value = true;
      await config.fetchData();
    } catch (error) {
      console.error("刷新数据失败:", error);
    } finally {
      // isLoading.value = false;
    }
    currentMenu.value = `${tab}`;
  }
}

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
  const { data: res } = await apihistoryProductsList({
    page: 1,
    page_size: 10,
  });
  data.value = res.GoodsItems.reduce(
    (prev, curItem) => {
      const date = curItem.created_at_fmt.split(" ")[0];
      if (!prev[date]) prev[date] = [];
      prev[date].push({ ...curItem, isChecked: false });
      return prev;
    },
    {} as Record<string, Goods[]>,
  );
}

// // 收藏列表（假设你有这个API）
// async function getCollectList() {
//   const { data: res } = await apiCollectProductsList({
//     page: 1,
//     page_size: 10,
//   });
//   data.value = res.items; // 根据实际API调整
// }

// // 订单列表（假设你有这个API）
// async function getOrderList() {
//   const { data: res } = await apiOrderList({ page: 1, page_size: 10 });
//   data.value = res.orders; // 根据实际API调整
// }

// ========== 2. 组件配置表：每个组件绑定自己的数据和刷新函数 ==========

interface ComponentConfig {
  component: Component;
  fetchData: () => Promise<void>;
  title: string;
  icon: string;
}

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
    fetchData: async () => {
      /* 暂时没有 */
    },
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
// 自动生成菜单项的工厂函数
function createMenuItem(url: keyof typeof componentConfigMap): MenuItem {
  const config = componentConfigMap[url];
  if (!config) {
    throw new Error(`未找到对应的配置: ${url}`);
  }
  return {
    title: config.title,
    url,
    icon: config.icon, // 你的图标映射
    // 点击菜单时，切换组件并刷新数据
    onClick: async (item: MenuItem) => {
      // 设置路由参数为当前点击的菜单
      router.push({ query: { tab: item.url } });
      // 切换当前组件
      currentComponent.value = config.component;
      currentRefreshFn.value = config.fetchData;
      // isLoading.value = true;
      try {
        await config.fetchData();
      } catch (error) {
        console.error("刷新数据失败:", error);
      } finally {
        // isLoading.value = false;
      }
    },
  };
}

const loadingStore = useLoadingStore();

// 然后菜单定义变得超简单
const menuItems: MenuItem[] = [
  createMenuItem("/user/myUserInfo"),
  createMenuItem("/user/myOrder"),
  createMenuItem("/user/myCollect"),
  createMenuItem("/user/myHistory"),
  createMenuItem("/user/myAddress"),
  createMenuItem("/user/mySetting"),
  // ...
];
// ========== 3. 统一的刷新函数（根据当前组件动态调用） ==========

const currentRefreshFn = ref<(() => Promise<void>) | null>(null);

// 统一的刷新入口
async function refreshCurrentComponent() {
  if (currentRefreshFn.value) {
    try {
      // isLoading.value = true;
      await currentRefreshFn.value();
    } catch (error) {
      console.error("刷新数据失败:", error);
    } finally {
      // isLoading.value = false;
    }
  }
}
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
