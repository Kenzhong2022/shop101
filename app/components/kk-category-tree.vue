<template>
  <div class="flex flex-col gap-10px mx-[10px] text-[#333] font-500">
    <div
      v-for="item in categoryTree"
      :key="item.id"
      class="text-sm font-400 flex-1 min-w-[330px] min-h-[40px] flex items-center justify-start relative"
    >
      <!-- 主分类 -->
      <div
        class="absolute z-1 w-[80px] px-12px py-8px font-500 text-center shrink-0 cursor-pointer rd-20px bg-primary text-[#f5f5f5]"
      >
        {{ item.name }}
      </div>
      <!-- 子分类 -->
      <div
        v-if="item?.children"
        class="absolute z-0 left-[calc(80px+24px)] right-0 rd-r-20px rd-l-0px hover:bg-[var(--el-color-primary-light-3)] hover:text-[#f5f5f5] text-[#333] ml-[-15px] flex-1"
      >
        <div class="pl-24px flex items-center justify-start">
          <div
            v-for="(child, idx) in item.children"
            :key="child.id"
            @click="handleClick(child)"
          >
            <!-- 亮黄色 -->
            <!-- 使用 Tailwind + 自定义上浮 -->
            <div class="float-text py-8px">
              {{ child.name }}
            </div>
            <span
              v-if="idx < item?.children?.length - 1"
              class="inline-block w-[1px] h-[12px] mx-[10px]"
              >|</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryTree } from "~~/server/types/category";
import { useRouter } from "vue-router";
import { getCategoryTreeApi } from "@/api/category";
import { ref, onMounted } from "vue";

const router = useRouter();
defineProps({});

onMounted(async () => {
  // 初始化分类树
  categoryTree.value = await getCategoryTree();
  // 递归获取子分类
  for (const item of categoryTree.value) {
    item.children = await getCategoryTree(item.id);
  }
});

function handleClick(child: CategoryTree) {
  router.push({
    path: "/goods/list",
    query: {
      category_id: child.id,
    },
  });
}

const categoryTree = ref<CategoryTree[]>([]);

/**
 * 获取分类树
 * @param id 分类id
 * @returns 分类树
 */
async function getCategoryTree(
  id: number | null = null,
): Promise<CategoryTree[]> {
  return getCategoryTreeApi({ parent_id: id }).then((res) => {
    return res;
  });
}
</script>

<style scoped>
.float-text {
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block; /* 关键：transform 对行内元素无效 */
}

.float-text:hover {
  color: #ffff00;
  font-weight: 700;
  transform: translateY(-4px);
  text-shadow: 0 4px 12px rgba(255, 255, 0, 0.4);
}

/* hover取消时（即非hover状态）：触发下落过冲动画 */
.float-text:not(:hover) {
  animation: dropBounce 0.5s ease;
}

/* 下落过冲关键帧：从当前位置（-8px）→ 过冲下落 → 回弹 → 稳定 */
@keyframes dropBounce {
  0% {
    transform: translateY(-8px);
  }
  40% {
    transform: translateY(8px); /* 过冲下落（低于原位） */
  }
  70% {
    transform: translateY(-4px); /* 小幅回弹 */
  }
  100% {
    transform: translateY(0); /* 回到原位 */
  }
}
</style>
