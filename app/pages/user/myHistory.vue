<!-- 我的历史列表 -->
<template>
  <div class="flex flex-col">
    <!-- 我的历史列表标题 -->
    <div class="text-20px font-bold flex justify-between items-center">
      <div>我的历史</div>
      <div class="flex flex-row gap-12px">
        <el-checkbox :model-value="all_check" size="large" @change="toggleAll">
          <span class="text-20px font-bold text-[#000]">全选</span>
          <span class="text-14px text-gray-500">
            ( {{ total_count }} 件商品 )
          </span>
        </el-checkbox>
        <el-button size="large" type="primary" @click="deleteSelected"
          >批量删除</el-button
        >
      </div>
    </div>
    <div>
      <!-- 浏览历史列表 -->
      <div
        v-loading="isLoading"
        v-for="date in Object.keys(historyList || {})"
        :key="date"
      >
        <div class="text-20px font-bold">
          <span> {{ date }} </span>
          <span>
            {{ date === dayjs().format("YYYY-MM-DD") ? " 今天" : "" }}</span
          >
          <span>
            {{
              date === dayjs().subtract(1, "day").format("YYYY-MM-DD")
                ? " 昨天"
                : ""
            }}</span
          >
          <span class="text-14px text-gray-500"
            >( 共{{ historyList[date]?.length || 0 }}件商品 )</span
          >
        </div>
        <div class="flex flex-wrap px-20px h-100%">
          <kk-goods-item
            ref="goodsItemRefs"
            :data="historyList[date] || []"
            :collected-mode="true"
            :history-mode="true"
            @click="handleClick"
            @check-change="({ id, checked }) => updateHistoryItem(id, checked)"
          />
        </div>
      </div>
      <el-empty
        v-if="0"
        description="暂无浏览历史"
        class="absolute top-50% translate-y-[-50%] left-50% translate-x-[-50%]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import type { Goods } from "~~/server/types/goods";
import { userBehaviorProductsDelete } from "~/api/user-behavior/products";
import KKGoodsItem from "~/components/kk-goods-item.vue";
// 引入消息提示组件
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

const historyList = ref<Record<string, Goods[]>>({});

// 监听 props.data 变化，预处理数据
watch(
  () => props.data,
  (newData) => {
    historyList.value = {};
    if (Array.isArray(newData)) {
      // 预处理数据，将商品按日期分组
      if (newData.length > 0) {
        newData.forEach((item) => {
          const date =
            (item as any).created_at_fmt?.split(" ")[0] || "未知日期";
          if (!historyList.value[date]) historyList.value[date] = [];
          historyList.value[date].push({ ...item, isChecked: false });
        });
      }
    }
  },
);

const emit = defineEmits(["refresh"]);

const goodsItemRefs = ref<InstanceType<typeof KKGoodsItem>[]>();
// 监听 goodsItemRefs 变化
watch(goodsItemRefs, (refs) => {
  console.log(refs);
});

// 全选状态：取决于所有商品是否都被选中
const all_check = computed(() => {
  if (!historyList.value) return false;
  for (const date in historyList.value) {
    const flag =
      Array.isArray(historyList.value[date]) &&
      historyList.value[date].some((item: Goods) => !item.isChecked); // 检查是否有商品未被选中
    if (flag) return false;
  }
  return true;
});
// 计算选中商品id列表，通过historyList.value遍历所有日期的商品数据，收集选中的商品id
const selected_ids = computed(() => {
  const ids: number[] = [];
  // 遍历所有日期的商品数据，收集选中的商品id
  for (const date in historyList.value) {
    historyList.value[date]?.forEach((item: Goods) => {
      if (item.isChecked) ids.push(item.id);
    });
  }
  return ids;
});

// 全选/取消全选方法
function toggleAll(value: boolean) {
  console.log("全选状态:", value);
  for (const date in historyList.value) {
    historyList.value[date]?.forEach((item: Goods) => {
      item.isChecked = value;
    });
  }
}

const total_count = computed(() => {
  let count = 0;
  // 累加所有日期里面 商品的选中数量
  for (const date in historyList.value) {
    if (!Array.isArray(historyList.value[date])) continue;
    count =
      count +
      (historyList.value[date]?.filter((item: Goods) => item.isChecked)
        .length || 0);
  }
  return count;
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
  // 弹窗=> 确认？ 调api删除选中商品
  ElMessageBox.confirm(`确定删除 ${total_count.value} 件商品吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 调api删除选中商品
      await userBehaviorProductsDelete({
        productIds: selected_ids.value,
        action_type: 1,
      });
      // 删除成功后，刷新当前页面数据
      emit("refresh");
      $message.success(`成功删除 ${total_count.value} 件商品`);
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    });
}

// 点击商品跳转详情页
function handleClick(goodsItem: Goods) {
  // 上报商品点击行为
  const { track } = useProductBehavior(goodsItem.id, {
    behaviorType: "click",
    autoTrack: true,
  }) as { track: () => void };
  // 跳转详情页
  navigateTo(`/goods/${goodsItem.id}/detail`);
}

// 点击操作按钮处理函数
function updateHistoryItem(id: number, checked: boolean) {
  // 遍历所有日期的商品数据，找到对应id的商品并更新其选中状态
  for (const date in historyList.value) {
    const goodsItem = historyList.value[date]?.find((item) => item.id === id);
    if (goodsItem) {
      goodsItem.isChecked = checked;
      break; // 找到后退出循环
    }
  }
}
</script>
