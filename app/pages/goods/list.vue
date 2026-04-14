<template>
  <div class="flex flex-row">
    <div class="flex-[1] flex flex-col">
      <kk-category-tree :isCollectedMode="true" />
    </div>
    <div class="flex flex-wrap px-20px flex-[4]">
      <!-- 一排五个 gap25 -->
      <kk-goods-item
        :collected-mode="true"
        :data="goodsList"
        :loading="loadingGoods"
        @loadMore="loadMore"
        :has-more="hasMore"
        @click="handleClick"
        @check-change="({ id, checked }) => updateItemChecked(id, checked)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiGoodsList } from "~/api/goods";
import type { Goods } from "~~/server/types/goods";
const { $message } = useNuxtApp();
import { useRoute } from "vue-router";
const route = useRoute();
onMounted(() => {
  console.log(route.query.category_id);
});
const currentPage = ref<number>(1);
const hasMore = ref<boolean>(true);
const loadingGoods = ref<boolean>(false);
const goodsList = ref<Goods[]>([]);

onMounted(() => {
  getGoodsList();
});

// 监听路由变化，当分类ID变化时，重置分页并重新加载商品
watch(
  () => route.query.category_id,
  (newVal) => {
    if (newVal) {
      currentPage.value = 1;
      getGoodsList();
    }
  },
);

async function getGoodsList() {
  // 从路由参数中获取分类ID
  const category_id = Number(route.query.category_id);
  loadingGoods.value = true;
  // 是否没有更多
  await apiGoodsList({
    category_id,
    page: currentPage.value,
    page_size: 5,
  })
    .then((res) => {
      // 检查是否有更多数据
      hasMore.value = res.data.list.length !== 0;
      // 合并商品列表，追加新数据
      goodsList.value = [...(goodsList.value || []), ...res.data.list];
      // 初始化新数据的 isChecked 为 false
      goodsList.value.forEach((item) => {
        item.isChecked = false;
      });
    })
    .finally(() => {
      currentPage.value++;
      loadingGoods.value = false;
      $message.success("加载完成");
    });
  return hasMore.value;
}

/* 追加 5 行并重新监听最后一行 */
async function loadMore() {
  $message.info("加载更多...");
  hasMore.value = await getGoodsList(); // 1. 先加载数据
  if (!hasMore.value) {
    $message.info("没有更多商品了");
    // 没有更多商品了，停止监听最后一行
  }
}

// 点击商品跳转详情页
function handleClick(goodsItem: Goods) {
  // 上报商品点击行为
  const { track } = useProductBehavior(goodsItem.id, {
    behaviorType: "click",
    autoTrack: true,
    sourcePage: window.location.href,
  }) as { track: () => void };
  // 跳转详情页
  navigateTo(`/goods/${goodsItem.id}/detail`);
}

// 点击操作按钮处理函数
function updateItemChecked(id: number, checked: boolean) {
  const goodsItem = goodsList.value?.find((item) => item.id === id);
  if (goodsItem) {
    goodsItem.isChecked = checked;
  }
}
</script>
