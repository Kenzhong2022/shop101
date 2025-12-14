/** * 会员中心页面 * * 功能特点： * - 展示用户个人信息 * - 会员等级和积分系统 *
- 订单管理 * - 个人设置 * - 会员专属功能 */

<template>
  <el-card class="user-container" shadow="never">
    <!-- 左右分区：左区域【菜单】，右区域【菜单内容】 -->
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
            @click="() => {(fileInput as HTMLInputElement).click()}"
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
      <!-- 菜单 -->
      <el-menu
        class="menu-contaniner"
        @select="handleSelect"
        :default-active="menuList[2]?.index || ''"
      >
        <kk-menu :menu-items="menuList"> </kk-menu>
      </el-menu>
    </div>
    <div class="flex-1">
      <el-card class="h-full">
        <h2>
          还有
          <el-countdown
            :value="expTime"
            format="HH:mm:ss"
            :auto-start="true"
            @finish="handleTokenExpire"
          />
          token就会过期
        </h2></el-card
      >
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
import type { MenuItem } from "~/components/kk-menu.vue";
const menuList: MenuItem[] = [
  // 个人信息 订单记录 收藏夹 账号设置 退出登录
  {
    title: "个人信息",
    index: "/user/myUser",
    icon: "icon-yonghu-copy",
  },
  {
    title: "订单记录",
    index: "/user/myOrder",
    icon: "icon-lishijilu_o",
  },
  {
    title: "收藏夹",
    index: "/user/myCollect",
    icon: "icon-collection",
  },
  {
    title: "账号设置",
    index: "/user/mySetting",
    icon: "icon-setting-copy",
  },
  {
    title: "退出登录",
    index: "/login/myLogin",
    icon: "logout",
  },
  {
    title: "测试菜单1",
    index: "/user/test1",
    icon: "icon-test",
    children: [
      {
        title: "测试菜单1-1",
        index: "/user/test1-1",
        icon: "icon-test",
        children: [
          {
            title: "测试菜单1-1-1",
            index: "/user/test1-1-1",
            icon: "icon-test",
            children: [
              {
                title: "测试菜单1-1-1-1",
                index: "/user/test1-1-1-1",
                icon: "icon-test",
              },
            ],
          },
        ],
      },
      {
        title: "测试菜单1-2",
        index: "/user/test1-2",
        icon: "icon-test",
      },
    ],
  },
];

// 头像是否悬停状态
const isHovered = ref(false);

// 倒计时时间状态
const expTime = ref<number>(0);

// 页面加载完成后的操作
onMounted(() => {
  expTime.value = userState.value.expireTime;
});
onActivated(() => {
  const flag = checkTokenExpiration();
  if (!flag) {
    handleTokenExpire();
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
const handleSelect = (index: string) => {
  console.log(index);
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
// 可以在这里添加页面特定的样式
.color-card {
  @apply p-4 rounded-lg shadow-sm border border-gray-200 bg-white;
}

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
