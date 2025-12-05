<template>
  <!-- 右键菜单 -->
  <div class="" ref="contextMenuRef">
    <div ref="bodySlotRef">
      <slot name="body">
        <!-- 应该出现菜单的位置 -->
      </slot>
    </div>
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
        <div
          class="flex flex-col hover:bg-primary hover:text-white cursor-pointer p-2 rounded-md"
          v-for="(item, index) in menuItems"
          :key="index"
        >
          <div @click="handleSelect(item)">{{ item.label }}</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { useContextMenu } from "@/composables/useContextMenu";
const contextMenuRef = ref(null);
const { isShow, x, y, hideMenu, turnOffLastActiveMenu } =
  useContextMenu(contextMenuRef);
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [{ label: "菜单1" }, { label: "菜单2" }, { label: "菜单3" }],
  },
  index: {
    type: Number,
    default: 0,
  },
});

//emit 事件
const emit = defineEmits(["select"]);
const bodySlotRef = ref();

const handleTTurnOffLastActiveMenu = () => {
  turnOffLastActiveMenu();
};

const handleSelect = (item) => {
  console.log("点击了", item, contextMenuRef.value);
  emit("select", item, contextMenuRef.value);
  hideMenu();
};

// 暴露方法（供父组件调用，可选）
defineExpose({
  hideMenu,
  handleTTurnOffLastActiveMenu,
});
</script>
