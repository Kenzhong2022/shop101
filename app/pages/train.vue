/** * 训练场 */
<template>
  <div class="train-container">
    <h1>训练场</h1>

    <!-- 菜单组件 -->
    <el-card>
      <el-menu>
        <kk-menu :menuItems="menuList" />
      </el-menu>
    </el-card>

    <!-- 上传图片组件 -->
    <el-card>
      <kk-upload-orig />
    </el-card>
    <div>
      <h2>右键菜单示例</h2>
      <!-- 最简单的右键菜单使用案例 -->
      <ContextMenu
        class="b-solid w-500px h-500px"
        :menuItems="[
          { label: '测试菜单1' },
          { label: '测试菜单2' },
          { label: '测试菜单3' },
        ]"
        ref="contextMenuRef"
        @select="handleSelect"
      >
        <template #body>
          <div class="bg-red w-full h-full text-white text-center">
            在这个区域内右键点击试试看!
          </div>
        </template>
      </ContextMenu>
      <ContextMenu
        class="b-solid w-500px h-500px"
        :menuItems="[
          { label: '测试菜单1' },
          { label: '测试菜单2' },
          { label: '测试菜单3' },
        ]"
      >
        <template #body>
          <div class="bg-red w-full h-full text-white text-center">
            在这个区域内右键点击试试看!123123
          </div>
        </template>
      </ContextMenu>
    </div>

    <el-card>
      <LazyKkImage
        :src="
          'https://res.cloudinary.com/dlji1nmdj/image/upload/v1763887762/' +
          '写真杂志2_niclz2'
        "
      />
    </el-card>
    <!-- 基础用法 -->
    <el-card>
      <h2>基础SVG加载动画</h2>
      <kk-svg-loader />
    </el-card>

    <!-- 自定义尺寸 -->
    <el-card>
      <h2>自定义尺寸 (200x150)</h2>
      <kk-svg-loader :width="200" :height="150" />
    </el-card>

    <!-- 自定义文字 -->
    <el-card>
      <h2>自定义加载文字</h2>
      <kk-svg-loader loading-text="正在上传..." :width="300" :height="200" />
    </el-card>

    <!-- 自定义样式 -->
    <el-card>
      <h2>自定义样式类</h2>
      <kk-svg-loader
        custom-class="my-custom-loader"
        :width="250"
        :height="180"
      />
    </el-card>

    <!-- 快速旋转 -->
    <el-card>
      <h2>快速旋转效果</h2>
      <kk-svg-loader-fast />
    </el-card>

    <!-- 双色圆环 -->
    <el-card>
      <h2>双色圆环效果</h2>
      <kk-svg-loader-dual-color />
    </el-card>

    <!-- 脉冲效果 -->
    <el-card>
      <h2>脉冲缩放效果</h2>
      <kk-svg-loader-pulse />
    </el-card>
    <el-card>
      <h2>雷达扫描效果</h2>
      <kk-radar />
    </el-card>
    <!-- 原始上传组件 -->
    <el-card>
      <h2>上传组件</h2>
      <kk-upload></kk-upload>
      <kk-cld-image
        src="banner4_guxg75"
        :width="300"
        :height="300"
        alt="My Awesome Image"
        :quality="10"
        gravity="face"
        crop="thumb"
        :overlays="[
          {
            position: {
              gravity: 'north',
              y: 60,
            },
            text: {
              color: 'rgb:52a4ff80',
              fontFamily: 'Source Sans Pro',
              fontSize: 320,
              fontWeight: 'black',
              text: 'MUSIC',
              letterSpacing: -10,
              lineSpacing: -100,
              stroke: true,
              border: '20px_solid_rgb:2d0eff99',
            },
          },
          {
            position: {
              gravity: 'south',
              y: 60,
            },
            text: {
              color: 'rgb:52a4ff80',
              fontFamily: 'Source Sans Pro',
              fontSize: 320,
              fontWeight: 'black',
              text: 'IS LIFE',
              letterSpacing: -10,
              lineSpacing: -100,
              stroke: true,
              border: '20px_solid_rgb:2d0eff99',
            },
          },
        ]"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
const contextMenuRef = ref(null);
const handleSelect = async (item: any) => {
  console.log(
    "点击了",
    item,
    (await (contextMenuRef.value as any).handleCopy()) || "无"
  );
};
import type { MenuItem } from "@/components/kk-menu.vue";

// 菜单数据（树形结构，index 唯一，无循环引用）
const menuList = ref<MenuItem[]>([
  {
    index: "1",
    title: "首页",
  },
  {
    index: "2",
    title: "用户管理",
    children: [
      { index: "2-1", title: "用户列表" },
      {
        index: "2-2",
        title: "角色管理",
        children: [
          { index: "2-2-1", title: "角色配置" }, // 三级菜单
          {
            index: "2-2-2",
            title: "权限分配",
            children: [
              {
                index: "2-2-2-1",
                title: "分配角色",
                children: [{ index: "2-2-2-1-1", title: "分配角色1" }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    index: "3",
    title: "菜单管理",
    children: [], // 空数组，不会触发递归（终止条件生效）
  },
]);
</script>

<style scoped>
.train-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.my-custom-loader {
  border: 2px solid #007acc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
