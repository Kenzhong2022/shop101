<template>
  <!-- tabs导航栏 -->
  <el-tabs :tab-position="tabPosition" class="w-800px">
    <el-tab-pane v-for="item in tabsList" :key="item.label" :label="item.label">
      <component :is="item.component" :data="item.data" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TabsInstance } from "element-plus";
import type { ReviewListData, ApiResponse } from "@/types/review";
import UsersComment from "./users-comment.vue";
import GoodsParams from "./goods-params.vue";
import { apiGoodsReviews } from "@/api/review";

const tabPosition = ref<TabsInstance["tabPosition"]>("top");

// 使用泛型让类型更精确
interface TabItem<T = any> {
  label: string;
  component: any;
  data: T;
}

// 分别定义两个tab的数据，避免类型混乱
const reviewsData = ref<ReviewListData>({
  list: [],
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 0,
});

const paramsData = ref<{ name: string; value: string }[]>([
  { name: "商品名称", value: "商品A" },
  { name: "商品规格", value: "规格1" },
]);

// 动态组装tabsList（推荐：数据变化自动响应）
const tabsList = computed(() => [
  {
    label: "用户评价",
    component: UsersComment,
    data: reviewsData.value,
  },
  // {
  //   label: "商品详情",
  //   component: GoodsParams,
  //   data: paramsData.value,
  // },
]);

// 获取路由参数
const route = useRoute();
const goodsId = computed(() => Number(route.params.goodsId));

// 加载评论数据
const loadReviews = async () => {
  if (!goodsId.value) return;

  try {
    const res = (await apiGoodsReviews({
      goods_id: goodsId.value,
      page: 1,
      page_size: 10,
    })) as ApiResponse<ReviewListData>;

    // 直接赋值，响应式自动更新
    reviewsData.value = res.data as ReviewListData;
  } catch (error) {
    console.error("加载评论失败:", error);
  }
};

// 初始化加载
onMounted(() => {
  loadReviews();
});
</script>
