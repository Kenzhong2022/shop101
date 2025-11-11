<template>
  <div class="w-50 overflow-hidden">
    <el-col>
      <h5 class="flex justify-center menu-title">带三级菜单和Path的动态菜单</h5>
      <!-- 根菜单容器 -->
      <el-menu
        unique-opened
        :style="{ width: '100%' }"
        @open="handleOpen"
        @close="handleClose"
      >
        <!-- 1. 一级菜单循环：变量名语义化（firstLevelMenu = 一级菜单） -->
        <template
          v-for="firstLevelMenu in menuListOOTD"
          :key="firstLevelMenu.index"
        >
          <!-- 情况1：一级菜单有子菜单 → 渲染 el-sub-menu -->
          <!-- 【核心改动1】移除原不规范的 class="bg-#333"，改由SCSS统一控制样式，避免冲突 -->
          <el-sub-menu
            v-if="firstLevelMenu.children && firstLevelMenu.children.length"
            :index="firstLevelMenu.index"
          >
            <template #title>
              <span>{{ firstLevelMenu.title }}</span>
            </template>

            <!-- 2. 二级菜单循环：变量名区分层级（secondLevelMenu = 二级菜单） -->
            <template
              v-for="secondLevelMenu in firstLevelMenu.children"
              :key="secondLevelMenu.index"
            >
              <!-- 情况1：二级菜单有子菜单 → 渲染 el-sub-menu -->
              <el-sub-menu
                v-if="
                  secondLevelMenu.children && secondLevelMenu.children.length
                "
                :index="secondLevelMenu.index"
              >
                <template #title>
                  <span>{{ secondLevelMenu.title }}</span>
                </template>

                <!-- 3. 三级菜单循环：变量名区分层级（thirdLevelMenu = 三级菜单） -->
                <template
                  v-for="thirdLevelMenu in secondLevelMenu.children"
                  :key="thirdLevelMenu.index"
                >
                  <!-- 情况1：三级菜单有子菜单 → 渲染 el-sub-menu（四级菜单） -->
                  <el-sub-menu
                    v-if="
                      thirdLevelMenu.children && thirdLevelMenu.children.length
                    "
                    :index="thirdLevelMenu.index"
                  >
                    <template #title>
                      <span>{{ thirdLevelMenu.title }}</span>
                    </template>

                    <!-- 4. 四级菜单循环：变量名 fourthLevelMenu，避免与外层冲突 -->
                    <el-menu-item
                      v-for="fourthLevelMenu in thirdLevelMenu.children"
                      :key="fourthLevelMenu.index"
                      :index="fourthLevelMenu.index"
                      @click="handleMenuClick(fourthLevelMenu)"
                    >
                      <span>{{ fourthLevelMenu.title }}</span>
                    </el-menu-item>
                  </el-sub-menu>

                  <!-- 情况2：三级菜单无子菜单 → 直接渲染 el-menu-item -->
                  <el-menu-item
                    v-else
                    :index="thirdLevelMenu.index"
                    @click="handleMenuClick(thirdLevelMenu)"
                  >
                    {{ thirdLevelMenu.title }}
                  </el-menu-item>
                </template>
              </el-sub-menu>

              <!-- 情况2：二级菜单无子菜单 → 直接渲染 el-menu-item -->
              <el-menu-item
                v-else
                :index="secondLevelMenu.index"
                @click="handleMenuClick(secondLevelMenu)"
              >
                {{ secondLevelMenu.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>

          <!-- 情况2：一级菜单无子菜单 → 直接渲染 el-menu-item -->
          <el-menu-item
            v-else
            :index="firstLevelMenu.index"
            @click="handleMenuClick(firstLevelMenu)"
          >
            <span>{{ firstLevelMenu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-col>
  </div>
</template>

<script lang="ts" setup>
// 导入类型
import type { Component } from "vue";
import { useRouter } from "vue-router";
// import {
//     Chicken,
//     Document,
//     Menu as IconMenu,
//     Location,
//     Setting,
//     User, // 新增用户图标用于三级菜单示例
// } from "@element-plus/icons-vue";
// 定义菜单数据的 TypeScript 接口
interface MenuItem {
  index: string;
  title: string;
  path: string;
  children?: MenuItem[]; // `children` 为「可选数组」，允许不存在
}
// 菜单数据源：保持原结构不变，确保路径（path）和索引（index）唯一
const menuListOOTD: MenuItem[] = [
  // 主流穿衣风格（一级菜单）
  {
    index: "1",
    title: "主流穿衣风格",
    path: "outfitsOfStyle",
    children: [
      {
        index: "1-1",
        title: "亚洲区",
        path: "outfitsOfStyle/asia",
        children: [
          {
            index: "1-1-1",
            title: "亚洲区-日式穿搭",
            path: "/category/outfitsOfStyle/asia/japaneseStyle",
          },
          {
            index: "1-1-2",
            title: "亚洲区-韩式穿搭",
            path: "/category/outfitsOfStyle/asia/koreanStyle",
          },
        ],
      },
      {
        index: "1-2",
        title: "欧美区",
        path: "outfitsOfStyle/west",
        children: [
          {
            index: "1-2-1",
            title: "欧美区-法式穿搭",
            path: "/category/outfitsOfStyle/west/frenchStyle",
          },
          {
            index: "1-2-2",
            title: "欧美区-美式穿搭",
            path: "/category/outfitsOfStyle/west/americanStyle",
          },
        ],
      },
    ],
  },
  // 衣服的风格分类（一级菜单）
  {
    index: "2",
    title: "衣服的风格分类",
    path: "classificationOfClother",
    children: [
      {
        index: "2-1",
        title: "衣服的风格分类-小",
        path: "/category/classificationOfClother/sizeOfMaterial",
      },
      {
        index: "2-2",
        title: "衣服的风格分类-柔",
        path: "/category/classificationOfClother/genderNeutralStyle",
      },
      {
        index: "2-3",
        title: "衣服的风格分类-弱",
        path: "/category/classificationOfClother/vibe",
      },
    ],
  },
  // 我适合哪些风格（一级菜单）
  {
    index: "3",
    title: "我适合哪些风格 ?",
    path: "howToChooseStyle/chooseStyle",
    children: [
      {
        index: "3-1",
        title: "小巧的风格",
        path: "howToChooseStyle/chooseStyle/petite",
        children: [
          {
            index: "3-1-1",
            title: "温柔款",
            path: "howToChooseStyle/chooseStyle/petite/soft",
            children: [
              {
                index: "3-1-2-1",
                title: "韩式穿搭",
                path: "/category/outfitsOfStyle/asia/koreanStyle",
              },
            ],
          },
          {
            index: "3-1-2",
            title: "中性款",
            path: "howToChooseStyle/chooseStyle/petite/genderNeutral",
            children: [
              {
                index: "3-1-2-2",
                title: "日式穿搭",
                path: "/category/outfitsOfStyle/asia/japaneseStyle",
              },
            ],
          },
        ],
      },
      {
        index: "3-2",
        title: "高挑的风格",
        path: "howToChooseStyle/chooseStyle/statueque",
        children: [
          {
            index: "3-2-1",
            title: "温柔款",
            path: "howToChooseStyle/chooseStyle/statueque/soft",
            children: [
              {
                index: "3-2-1-1",
                title: "法式穿搭",
                path: "/category/outfitsOfStyle/west/frenchStyle",
              },
            ],
          },
          {
            index: "3-2-2",
            title: "中性款",
            path: "howToChooseStyle/chooseStyle/statueque/genderNeutral",
            children: [
              {
                index: "3-2-2-1",
                title: "美式穿搭",
                path: "/category/outfitsOfStyle/west/americanStyle",
              },
            ],
          },
        ],
      },
    ],
  },
];

// 初始化路由
const router = useRouter();

// 处理菜单点击事件：实现路由跳转功能
const handleMenuClick = (menuItem: MenuItem) => {
  console.log(`菜单点击测试 - 标题: ${menuItem.title}, 路径: ${menuItem.path}`);

  // 实现路由跳转 - 将菜单路径转换为完整路由路径
  // 检查路径是否以'/'开头，如果不是则添加
  const routePath = menuItem.path.startsWith("/")
    ? menuItem.path
    : `/${menuItem.path}`;

  // 执行路由跳转
  router.push(routePath).catch((err) => {
    // 如果路由不存在，提供友好提示
    if (err.name === "NavigationFailure") {
      console.warn(
        `路由不存在: ${routePath}，请检查是否需要创建对应的页面文件`
      );
    }
  });
};

// 菜单展开事件：调试用，打印展开的菜单索引
const handleOpen = (key: string) => {
  console.log("打开子菜单：", key);
};

// 菜单关闭事件：调试用，打印关闭的菜单索引
const handleClose = (key: string) => {
  console.log("关闭子菜单：", key);
};
</script>

<style scoped lang="scss">
// 1. 定义颜色变量：后续改色只需修改这里，无需逐个改选择器
$menu-dark: (
  base-bg: #333,
  // 基础背景色（所有菜单层级）
  hover-bg: #666,
  // 悬停背景色
  active-bg: #999,
  // 选中背景色
  text-color: #fff,
  // 文字颜色
  title-color: #f0f0f0,
  // 菜单标题文字色
);

// 4. 子菜单容器样式：确保二级、三级子菜单背景与一级一致
:deep(.el-sub-menu.is-opened) {
  opacity: 0.9;
  background-color: map-get($menu-dark, base-bg) !important;
  // 子菜单标题垂直居中（修复原代码中align-items位置错误）
  .el-sub-menu__title {
    align-items: center !important;
    display: flex !important; // 确保align-items生效
  }
}

// 5. 子菜单标题样式：覆盖Element默认样式，保持深色
:deep(.el-sub-menu__title) {
  background-color: map-get($menu-dark, base-bg);
  color: map-get($menu-dark, text-color) !important;
  // 移除默认箭头颜色，适配深色（可选）
  .el-sub-menu__icon-arrow {
    color: map-get($menu-dark, text-color) !important;
  }
}

// 6. 菜单项样式：控制所有el-menu-item（包括三级、四级）
:deep(.el-menu-item) {
  background-color: map-get($menu-dark, base-bg) !important;
  color: map-get($menu-dark, text-color) !important;
  transition: background-color 0.3s ease !important; // 悬停过渡动画，更丝滑
}

// 7. 交互状态：悬停效果（所有菜单层级通用）
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: map-get($menu-dark, hover-bg) !important;
}

// 选中原子菜单
:deep(.el-menu-item.is-active) {
  background-color: map-get($menu-dark, active-bg) !important;
  color: #000 !important;
  font-weight: 500 !important; // 选中文字加粗，增强辨识度
}

// 9. 折叠弹出层适配：避免折叠时菜单背景色变浅（Element默认样式）
// :deep(.el-menu--popup) {
//   background-color: map.get($menu-dark, base-bg) !important;
//   // 弹出层中的子菜单也保持深色
//   .el-sub-menu {
//     background-color: map.get($menu-dark, base-bg) !important;
//   }
// }
</style>
