<template>
  <!-- 右键菜单 -->
  <div class="" ref="contextMenuRef">
    <slot>
      <!-- 应该出现菜单的位置 -->
    </slot>
    <!-- 菜单挂载的位置：为了解决嵌套层次中出现transform -->
    <teleport to="body">
      <!-- 菜单内容 -->
      <div
        class="context-menu"
        v-if="isShow"
        :style="{
          position: 'fixed',
          left: x + 'px',
          top: y + 'px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 9999,
        }"
      >
        鼠标位置{{ x }}, {{ y }}, 是否显示：{{ isShow }}
        <div
          class="flex flex-col hover:bg-primary hover:text-white cursor-pointer"
          v-for="(item, index) in menuItems"
          :key="index"
        >
          <div>{{ item.label }}</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { useContextMenu } from "@/composables/useContextMenu";
const contextMenuRef = ref(null);
const { isShow, x, y } = useContextMenu(contextMenuRef);
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [{ label: "菜单1" }, { label: "菜单2" }, { label: "菜单3" }],
  },
});
</script>
