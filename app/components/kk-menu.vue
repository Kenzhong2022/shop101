<template>
  <!-- 用 <template> 包裹，不产生额外 DOM，保持层级合法 -->
  <template v-for="item in menuItems" :key="item.index">
    <!-- 无子菜单（children 不存在 或 为空数组）：渲染普通菜单项 -->
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="item.index"
    >
      {{ item.title }}
    </el-menu-item>

    <!-- 有子菜单（children 存在且非空）：渲染子菜单 + 递归自身 -->
    <el-sub-menu v-else :index="item.index">
      <template #title> {{ item.title }} </template>
      <!-- 递归调用：传递当前节点的 children 作为子菜单数据 -->
      <KkMenu :menuItems="item.children" />
    </el-sub-menu>
  </template>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

// 定义菜单数据类型（确保数据格式正确）
export interface MenuItem {
  index: string; // 唯一标识（必须字符串，如 "1"、"1-1"）
  title: string; // 菜单名称
  children?: MenuItem[]; // 子菜单（可选）
  disabled?: boolean; // 可选：是否禁用
  path?: string; // 可选：路由路径
}

// 接收父组件传递的菜单数据
const props = defineProps<{
  menuItems: MenuItem[]; // 当前层级的菜单数据
}>();
</script>

<style lang="scss"></style>
