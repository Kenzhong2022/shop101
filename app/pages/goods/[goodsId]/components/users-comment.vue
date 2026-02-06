<template>
  <!-- 用户评价组件 -->
  <!-- 评价列表 -->
  <div
    v-for="item in list"
    :key="item.id"
    class="flex flex-row gap-12px mt-10px p-12px border-b-[1px] border-b-[#ccc] border-b-solid"
  >
    <!-- 左边头像 -->
    <div class="p-4px">
      <el-avatar
        :src="item.user.avatar"
        :size="50"
        class="my-avatar relative"
      />
    </div>

    <!-- 右边评价内容 -->
    <div class="flex-1">
      <div>用户：{{ item.user.user_name }}</div>
      <div>
        评价等级：
        <el-rate
          v-model="item.rating"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value} points"
        />
      </div>
      <div class="flex flex-row gap-12px text-[14px] text-[#666]">
        <div>评价时间：{{ dayjs(item.created_at).format("YYYY-MM-DD") }}</div>
        <div>购买的规格：{{ item.spec_snapshot }}</div>
      </div>
      <div>评价：{{ item.content }}</div>
      <!-- 评价图片列表 -->
      <div
        v-if="item?.images && item.images.length > 0"
        class="flex flex-row gap-8px flex-wrap mt-8px"
      >
        <div
          v-for="(img, index) in item.images"
          :key="index"
          class="w-160px h-160px rounded-4px overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
        >
          <el-image
            :src="img"
            alt="评价图片"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
      <!-- 右边追评 -->
      <div v-if="item?.replies && item.replies.length > 0" class="my-12px">
        <div>追评id：{{ item?.replies?.[0]?.id }}</div>
        <div>
          追评时间：{{
            dayjs(item?.replies?.[0]?.created_at).format("YYYY-MM-DD")
          }}
        </div>
        <div>追评内容：{{ item?.replies?.[0]?.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewListData } from "@/types/review";
import dayjs from "dayjs";

// dayjs("2025-01-15T03:00:00.000Z").format('YYYY-MM-DD'); // 2025-01-15
// dayjs("2025-01-15T03:00:00.000Z").format('YYYY年MM月DD日'); // 2025年01月15日
const props = defineProps({
  data: {
    type: Object as () => ReviewListData,
  },
});

const list = computed(() => props.data?.list || []);
</script>
