/** * 会员中心页面 * * 功能特点： * - 展示用户个人信息 * - 会员等级和积分系统 *
- 订单管理 * - 个人设置 * - 会员专属功能 */
<template>
  <client-only>
    <div class="user-container">
      <el-card shadow="never">
        <template #fallback>
          <div class="loading">加载中...</div>
        </template>
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
          <el-menu class="menu-contaniner" :default-active="menuItems[0]?.url">
            <kk-menu :menu-items="menuItems" />
          </el-menu>
        </div>
        <div class="flex-1">
          <el-card class="h-full">
            <!-- 动态组件切换 -->
            <transition name="fade-slide" mode="out-in">
              <component
                :is="currentComponent"
                v-if="currentComponent"
                :key="currentComponent"
                :data="data"
              />
            </transition>
          </el-card>
        </div>
        <!-- <h2>
        还有
        <el-countdown
          :value="expTime"
          format="HH:mm:ss"
          :auto-start="true"
          @finish="handleTokenExpire"
        />
        token就会过期
      </h2> -->
      </el-card>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { apiFavoritesProductsList } from "~/api/favorites/products";
import { useUser } from "~/composables/useUser";
import type { MenuItem } from "~/components/kk-menu.vue";
// ========== 使用 markRaw 包裹异步组件，防止被代理 ==========
const MyUserInfo = markRaw(
  defineAsyncComponent(() => import("./myUserInfo.vue")),
);
const MyOrder = markRaw(defineAsyncComponent(() => import("./myOrder.vue")));
const MyCollect = markRaw(
  defineAsyncComponent(() => import("./myCollect.vue")),
);
const MySetting = markRaw(
  defineAsyncComponent(() => import("./mySetting.vue")),
);
const MyHistory = markRaw(
  defineAsyncComponent(() => import("./myHistory.vue")),
);
// ========== 使用 shallowRef 存储当前组件 ==========
const currentComponent = shallowRef<Component>(MyUserInfo);

// 组件映射表
const componentMap: Record<string, Component> = {
  "/user/myUserInfo": MyUserInfo,
  "/user/myOrder": MyOrder,
  "/user/myCollect": MyCollect,
  "/user/mySetting": MySetting,
  "/user/myHistory": MyHistory,
};

const data = ref();

const menuItems: MenuItem[] = [
  // 个人信息 订单记录 收藏夹 账号设置 退出登录
  {
    title: "个人信息",
    url: "/user/myUserInfo",
    icon: "icon-yonghu-copy",
    // 点击事件
    onClick: (item: MenuItem) => {
      console.log("点击了个人信息", item);
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "订单记录",
    url: "/user/myOrder",
    icon: "icon-lishijilu_o",
    // 点击事件
    onClick: (item: MenuItem) => {
      console.log("点击了订单记录", item);
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "收藏夹",
    url: "/user/myCollect",
    icon: "icon-collection",
    // 点击事件
    onClick: async (item: MenuItem) => {
      console.log("点击了收藏夹", item);
      // 收藏历史商品列表
      const { data: res } = await apiFavoritesProductsList({
        page: 1,
        page_size: 10,
      });
      data.value = res;
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "浏览历史",
    url: "/user/myHistory",
    icon: "icon-history",
    // 点击事件
    onClick: (item: MenuItem) => {
      console.log("点击了浏览历史", item);
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "账号设置",
    url: "/user/mySetting",
    icon: "icon-setting-copy",
    // 点击事件
    onClick: (item: MenuItem) => {
      console.log("点击了账号设置", item);
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "退出登录",
    url: "/login/myLogin",
    icon: "logout",
    // 点击事件
    onClick: (item: MenuItem) => {
      console.log("点击了退出登录", item);
      currentComponent.value = componentMap[item.url] as Component;
    },
  },
  {
    title: "测试菜单1",
    url: "/user/test1",
    icon: "icon-test",
    children: [
      {
        title: "测试菜单1-1",
        url: "/user/test1-1",
        icon: "icon-test",
        children: [
          {
            title: "测试菜单1-1-1",
            url: "/user/test1-1-1",
            icon: "icon-test",
            children: [
              {
                title: "测试菜单1-1-1-1",
                url: "/user/test1-1-1-1",
                icon: "icon-test",
                // 点击事件
                onClick: (item: MenuItem) => {
                  console.log("点击了测试菜单1-1-1-1");
                },
              },
            ],
          },
        ],
      },
      {
        title: "测试菜单1-2",
        url: "/user/test1-2",
        icon: "icon-test",
        // 点击事件
        onClick: (item: MenuItem) => {
          console.log("点击了测试菜单1-2");
        },
      },
    ],
  },
];
const userState = useUser();

// 头像是否悬停状态
const isHovered = ref(false);

// 倒计时时间状态
const expTime = ref<number>(0);

// 页面加载完成后的操作
onMounted(() => {
  expTime.value = userState.value.expireTime;
});
// ========== 核心：页面激活时重置状态 ==========
onActivated(() => {
  // 检查 token
  const flag = checkTokenExpiration();
  if (!flag) {
    handleTokenExpire();
    return;
  }
});

// 处理token过期
function handleTokenExpire() {
  console.log("token已过期");
  // 清除过期的token
  // localStorage.removeItem("token");
  // 跳转到登录页面
  navigateTo("/login/myLogin");
}
const fileInput = ref<HTMLInputElement>();
const handleSelect = (url: string) => {
  console.log("点击了菜单:", url);
  // 跳转到登录页面
};
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
</script>

<style lang="scss" scoped>
.user-container {
  :deep(.el-card__body) {
    display: flex !important;
    gap: 20px;
  }
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
