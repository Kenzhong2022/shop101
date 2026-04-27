<!-- 搜索列表 -->
<template>
  <!-- 商品列表行 -->
  <div class="flex flex-wrap px-20px">
    <!-- 一排五个 gap25 -->
    <kk-goods-item
      :collected-mode="false"
      :data="goodsList"
      :loading="loadingGoods"
      @loadMore="loadMore"
      :has-more="hasMore"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
// 页面元数据
definePageMeta({
  title: "搜索结果",
  layout: "default",
  pageInfo: {
    showBanner: true,
  },
  layoutOptions: {
    showSearch: true,
    isStickyMode: true,
  },
});
import { apiGoodsList } from "~/api/goods";
import { useProductBehavior } from "~/composables/useProductBehavior";
import type { Goods } from "~~/server/types/goods";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { $message } = useNuxtApp();

const goodsList = ref<Goods[]>([]);
const loadingGoods = ref<boolean>(false);
const hasMore = ref<boolean>(true);
const currentPage = ref<number>(1);

// 监听路由参数变化，触发搜索
watch(
  () => route.query.keyword,
  async (newKeyword) => {
    if (process.client && newKeyword) {
      // 重置搜索状态
      goodsList.value = [];
      currentPage.value = 1;
      hasMore.value = true;
      await loadGoodsList();
    }
  },
  { immediate: true },
);

// 加载商品列表
async function loadGoodsList() {
  loadingGoods.value = true;
  try {
    const keyword = route.query.keyword as string;
    const response = await apiGoodsList({
      page: currentPage.value,
      page_size: 5,
      keyword, // 传递搜索关键词
    });

    hasMore.value = response.data.list.length !== 0;
    goodsList.value = [...goodsList.value, ...response.data.list];
    goodsList.value.forEach((item) => {
      item.isChecked = false;
    });
  } catch (error) {
    $message.error("搜索失败，请重试");
  } finally {
    loadingGoods.value = false;
  }
}

// 加载更多
async function loadMore() {
  if (process.client && hasMore.value && !loadingGoods.value) {
    $message.info("加载更多...");
    currentPage.value++;
    await loadGoodsList();
    if (!hasMore.value) {
      $message.info("没有更多商品了");
    }
  }
}

// 点击商品跳转详情页
function handleClick(goodsItem: Goods) {
  const { track } = useProductBehavior(
    goodsItem.id,
    {
      behaviorType: "click",
      autoTrack: true,
    },
    process.client ? window.location.href : "",
  ) as { track: () => void };

  track();
  navigateTo(`/goods/${goodsItem.id}/detail`);
}

// 初始化加载
onMounted(async () => {});
</script>
