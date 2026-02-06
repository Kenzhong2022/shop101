<template>
  <!-- 右键菜单组件 -->
  <div ref="contextMenuRef">
    <div class="h-100% w-100%">
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
          @click="handleSelect(item)"
        >
          <div>{{ item.label }}</div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useContextMenu } from "@/composables/useContextMenu";
const contextMenuRef = ref(null);
interface ContextMenuType {
  isShow: boolean;
  x: number;
  y: number;
  hideMenu: () => void;
  turnOffLastActiveMenu: () => void;
}
const { isShow, x, y, hideMenu, turnOffLastActiveMenu } = useContextMenu(
  contextMenuRef
) as ContextMenuType;

// 菜单项类型
interface MenuItemType {
  label: string;
  onClick: (params: any) => void;
}
const props = defineProps({
  // 传递一个数组 数组对象需要包含label属性作为显示文本，需要有onClick方法作为点击事件
  menuItems: {
    type: Array as PropType<MenuItemType[]>,
    default: () => [
      {
        label: "菜单1",
        onClick: () => {
          console.log("点击了菜单1");
        },
      },
    ],
  },
  // 传递一个索引值，用于指定点击菜单时，需要操作的元素索引
  index: {
    type: Number,
    default: 0,
  },
  bodyContentRef: {
    type: Array as PropType<Ref<HTMLElement>[]>,
    required: true,
  },
});

const handleTTurnOffLastActiveMenu = () => {
  turnOffLastActiveMenu();
};

/**
 * 处理点击菜单事件 调用菜单项的点击函数
 * @param item 点击的菜单项
 */
const handleSelect = (item: MenuItemType) => {
  item.onClick(props.bodyContentRef[props.index]);
  hideMenu();
};

// 暴露方法（供父组件调用，可选）
defineExpose({
  hideMenu,
  handleTTurnOffLastActiveMenu,
});
</script>
