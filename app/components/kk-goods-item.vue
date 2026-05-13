<template>
  <div
    class="p-2 box-border goodsItem"
    v-for="(goodsItem, index) in data"
    :key="goodsItem.id"
    @click.stop="handleClick(goodsItem)"
  >
    <!-- 商品图片区域（保留原有结构，移除无用 ref） -->
    <div class="overflow-hidden relative w-fit">
      <el-image
        v-if="goodsItem.image.startsWith('http')"
        :src="goodsItem.image"
        :alt="goodsItem.image"
        :width="280"
        :height="280"
      />
      <kk-cld-image
        v-else
        :src="goodsItem.image"
        :alt="goodsItem.image"
        :width="280"
        :height="280"
        :radius="20"
        :aspectRatio="280 / 280"
        gravity="auto"
        crop="fill"
      />
      <div
        class="absolute top-0 right-0 bg-red-500 text-white px-2 rounded-bl-lg"
      >
        热卖
      </div>
      <el-checkbox
        v-if="showCheckbox"
        :model-value="goodsItem.isChecked"
        size="large"
        class="checked_btn"
        @click.stop
        @change="handleCheckChange($event as boolean, goodsItem)"
      />
    </div>
    <!-- 商品信息区域 -->
    <div class="w-[280px] box-border p-[8px]">
      <div class="text-ellipsis whitespace-nowrap overflow-hidden">
        {{ goodsItem.goods_name }}
      </div>
      <div class="text-primary text-lg font-bold">
        <span>￥{{ goodsItem.price }}</span>
        <span class="text-sm text-gray-500">
          {{ goodsItem.sales || 0 }}人购买
        </span>
      </div>
      <div>{{ goodsItem.shop_name }}</div>
    </div>
  </div>

  <el-empty v-if="data.length === 0" description="暂无商品" class="w-full" />

  <!-- 哨兵 div：只有存在更多数据时才显示，用于触发加载更多 -->
  <div
    v-if="data.length > 0 && hasMore"
    ref="sentinelRef"
    class="load-sentinel"
  ></div>

  <el-divider v-if="!historyMode">
    {{ loading ? "加载中..." : "已到底部" }}
  </el-divider>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import type { Goods } from "~~/server/types/goods";

const props = defineProps({
  historyMode: {
    type: Boolean,
    default: false,
  },
  isCollectedMode: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "商品",
  },
  image: {
    type: String,
    default: "good_1_w3mjkm.webp",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array as PropType<Goods[]>,
    default: () => [],
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  collectedMode: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:isChecked",
  "loadMore",
  "click",
  "checkChange",
]);

const showCheckbox = ref(false);
watch(
  () => props.collectedMode,
  (newData) => {
    showCheckbox.value = newData;
  },
  { immediate: true },
);

// 哨兵元素的 ref
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 内部请求锁，防止短时间内重复触发
const isLoadingMore = ref(false);

// 重置锁：当外部 loading 变为 false 时，允许下一次加载
watch(
  () => props.loading,
  (newVal) => {
    if (!newVal) {
      isLoadingMore.value = false;
    }
  },
);

/**
 * 创建 IntersectionObserver 实例
 * threshold: 0.8 表示元素 80% 进入视口时触发
 */
function createObserver() {
  if (observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 只有元素进入视口比例 ≥ 0.8 时才触发加载
        if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
          // 防止重复触发：外部正在加载 或 内部锁未释放 或 没有更多数据
          if (props.loading || isLoadingMore.value || !props.hasMore) {
            return;
          }
          isLoadingMore.value = true;
          emit("loadMore");
        }
      });
    },
    {
      threshold: 0.8, // 80% 可见时触发
      rootMargin: "0px", // 无提前量，严格按照视口比例
    },
  );
}

/**
 * 开始观察哨兵元素
 */
function startObserving() {
  if (!observer || !sentinelRef.value) return;
  // 先断开之前的观察（避免重复观察或观察旧元素）
  observer.disconnect();
  observer.observe(sentinelRef.value);
}

/**
 * 停止观察（当 hasMore 为 false 或组件销毁时调用）
 */
function stopObserving() {
  if (observer) {
    observer.disconnect();
  }
}

// 监听哨兵元素变化、数据长度或 hasMore 变化，动态开启/关闭观察
watch(
  () => [sentinelRef.value, props.data.length, props.hasMore],
  () => {
    nextTick(() => {
      if (props.data.length > 0 && props.hasMore && sentinelRef.value) {
        createObserver(); // 确保 observer 已创建
        startObserving();
      } else {
        // 无更多数据或列表为空时停止观察
        stopObserving();
      }
    });
  },
  { flush: "post" },
);

// 组件初始化时创建 observer
onMounted(() => {
  createObserver();
  if (props.data.length > 0 && props.hasMore && sentinelRef.value) {
    startObserving();
  }
});

// 组件销毁时清理 observer
onUnmounted(() => {
  stopObserving();
  observer = null;
  isLoadingMore.value = false;
});

function handleClick(goodsItem: Goods) {
  emit("click", goodsItem);
}

function handleCheckChange(checked: boolean, item: Goods) {
  emit("checkChange", {
    id: item.id,
    checked,
    item,
  });
}

defineExpose({});
</script>

<style scoped lang="scss">
.goodsItem {
  --w: 300px;
  width: var(--w);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
}

.el-card {
  margin-bottom: 20px;
}

:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}

:deep(.checked_btn) {
  position: absolute;
  top: 16px;
  left: 16px;
  height: fit-content;

  .el-checkbox__inner {
    width: 20px;
    height: 20px;
  }
}

/* 哨兵 div 样式：透明、极小高度，不影响布局 */
.load-sentinel {
  width: 100%;
  height: 4px;
  background: transparent;
  pointer-events: none;
}
</style>
