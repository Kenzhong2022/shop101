<template>
  <div v-for="item in menuItems" :key="item.url">
    <!-- 无子菜单 -->
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="item.url"
      @click="handleClick(item)"
    >
      <i
        :class="['iconfont', item.icon, 'color-main']"
        class="mr-2"
        style="font-size: 24px"
      ></i>
      {{ item.title }}
    </el-menu-item>

    <!-- 有子菜单 -->
    <el-sub-menu v-else :index="item.url">
      <template #title>{{ item.title }}</template>
      <!-- 递归组件 -->
      <kk-menu :menu-items="item.children" />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
export interface MenuItem {
  url: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  onClick?: (item: MenuItem) => void;
}

defineProps<{
  menuItems: MenuItem[];
}>();

const handleClick = (item: MenuItem) => {
  // 如果有自定义点击事件则执行，否则执行默认跳转
  if (typeof item.onClick === "function") {
    item.onClick(item);
  } else {
    // 默认行为：使用 Vue Router 跳转
    // navigateTo(item.url)
  }
};
</script>
