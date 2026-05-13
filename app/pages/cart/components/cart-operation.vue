<template>
  <div class="flex flex-row items-center justify-center gap-20px py-[12px]">
    <div class="left-btn flex flex-row items-center justify-center gap-20px">
      <el-checkbox
        v-model="props.isAllSelected"
        @change="selectAll($event as boolean)"
      />
      <div class="mr-auto">全选</div>
      <el-button type="primary">移入收藏</el-button>
      <el-button type="primary" @click="removeSelected">删除</el-button>
    </div>
    <div class="ml-auto right-btn">
      <el-button type="default" @click="removeSelected">删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
// 引入消息提示组件
const { $message } = useNuxtApp();
const cartStore = useCartStore();
const props = defineProps({
  isAllSelected: {
    type: Boolean,
    default: false,
  },
});
/**
 * 全选/取消全选
 * @param checked 是否选中
 */
function selectAll(checked: boolean) {
  cartStore.toggleSelectAll(checked);
}
/**
 * 删除选中商品
 */
function removeSelected() {
  if (!cartStore.selectedItems.length) {
    $message.warning("请选择要删除的商品");
    return;
  }
  // 弹窗确认删除
  cartStore.removeCart(cartStore.selectedItems.map((item) => item.id));
  $message.success("删除成功");
}
</script>

<style scoped lang="scss">
:deep(.el-checkbox__input .el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
}
</style>
