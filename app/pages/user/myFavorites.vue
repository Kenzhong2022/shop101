<!-- 我的收藏 -->
<template>
  <div class="flex flex-col">
    <!-- 我的收藏标题 -->
    <div class="text-20px font-bold flex justify-between items-center">
      <div>我的收藏</div>
      <div class="flex flex-row gap-12px">
        <el-checkbox
          v-model="all_check"
          size="large"
          @click="toggleAll(all_check)"
        >
          <span class="text-20px font-bold text-[#000]">全选</span>
          <span class="text-14px text-gray-500">
            ( {{ total_count }} 件商品 )
          </span>
        </el-checkbox>
        <el-button size="large" type="primary" @click="deleteSelected"
          >全部取消收藏</el-button
        >
      </div>
    </div>
    <!-- 收藏商品列表 -->
    <div class="flex flex-wrap px-20px h-100%">
      <kk-goods-item
        ref="goodsItemRefs"
        :data="props.data || []"
        :collected-mode="true"
        @click="handleClick"
        @check-change="({ id, checked }) => updateFavorites(id, checked)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Goods } from "~~/server/types/goods";
import { userBehaviorProductsDelete } from "~/api/user-behavior/products";
import KKGoodsItem from "~/components/kk-goods-item.vue";
const { $message } = useNuxtApp();

const props = defineProps({
  data: {
    type: Array as PropType<Goods[]>,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["refresh"]);

const goodsItemRefs = ref<InstanceType<typeof KKGoodsItem>[]>();
watch(goodsItemRefs, (refs) => {
  console.log(refs);
});

// 全选状态：取决于所有商品是否都被选中
const all_check = computed(() => {
  if (!props.data || props.data.length === 0) return false;
  return (
    (Array.isArray(props.data) && props.data.every((item) => item.isChecked)) ||
    false
  );
});

// 选中商品id列表
const selected_ids = computed(() => {
  return (
    props.data?.filter((item) => item.isChecked).map((item) => item.id) || []
  );
});

// 全选/取消全选方法
const toggleAll = (val: boolean) => {
  console.log(val);
  props.data?.forEach((item) => {
    item.isChecked = !val;
  });
};

const total_count = computed(() => {
  return props.data?.filter((item) => item.isChecked).length || 0;
});

/**
 * 批量删除选中商品
 * @description: 确认删除选中商品后，调用api删除选中商品
 */
function deleteSelected() {
  if (!total_count.value) {
    $message.warning("请至少选择一件要删除的商品");
    return;
  }
  ElMessageBox.confirm(`确定删除 ${total_count.value} 件商品吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await userBehaviorProductsDelete({
        productIds: selected_ids.value,
        action_type: 2,
      });
      emit("refresh");
      $message.success(`成功删除 ${total_count.value} 件商品`);
    })
    .catch(() => {});
}

// 点击商品跳转详情页
function handleClick(goodsItem: Goods) {
  const { track } = useProductBehavior(goodsItem.id, {
    behaviorType: "click",
    autoTrack: true,
  }) as { track: () => void };
  navigateTo(`/goods/${goodsItem.id}/detail`);
}

// 点击操作按钮处理函数
function updateFavorites(id: number, checked: boolean) {
  const goodsItem = props.data?.find((item) => item.id === id);
  if (goodsItem) {
    goodsItem.isChecked = checked;
  }
}
</script>
