/** * 商品列表组件 */
<template>
  <div
    :ref="(el) => setItemRef(el, index)"
    class="p-2 box-border goodsItem"
    v-for="(goodsItem, index) in data"
    :key="goodsItem.id"
    @click.stop="handleClick(goodsItem)"
  >
    <!-- 商品图片区域 -->
    <div class="overflow-hidden relative w-fit" ref="goodsItemsRef">
      <kk-cld-image
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
      <!-- 操作按钮 -->
      <el-checkbox
        v-if="!collectedMode"
        :model-value="goodsItem.isChecked"
        size="large"
        class="checked_btn"
        @click.stop
        @change="handleCheckChange($event as boolean, goodsItem)"
      />
    </div>
    <!-- 商品信息区域 -->
    <div class="w-[280px] box-border p-[8px]">
      <!-- 商品名称：超过一行显示省略号 -->
      <div class="text-ellipsis whitespace-nowrap overflow-hidden">
        {{ goodsItem.goods_name }}
      </div>
      <div class="text-primary text-lg font-bold">
        <span>￥{{ goodsItem.price }}</span>
        <span class="text-sm text-gray-500">
          {{ goodsItem.sales || 0 }}人购买
        </span>
      </div>
      <div>店铺名: {{ goodsItem.shop_name }}</div>
    </div>
  </div>
  <!-- 分割线 -->
  <el-divider> {{ loading ? "加载中..." : "已到底部" }} </el-divider>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import type { Goods } from "~~/server/types/goods";
const props = defineProps({
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
  "loadMore", // 加载更多商品列表事件
  "click", // 点击商品事件
  "checkChange", // 点击操作按钮事件
]);

// 点击处理函数
function handleClick(goodsItem: Goods) {
  // 可以在这里添加点击效果、埋点等
  console.log("商品被点击:", goodsItem.id);

  // 触发事件，把商品数据传给父组件
  emit("click", goodsItem);
}

function handleCheckChange(checked: boolean, item: Goods) {
  // 通知父组件更新
  emit("checkChange", {
    id: item.id,
    checked,
    item,
  });
}

// ========== IntersectionObserver 逻辑 ==========

const itemRefs = ref<HTMLElement[]>([]);
let observer: IntersectionObserver | null = null;
let curObservedEl: HTMLElement | null = null;

// 收集 DOM 引用（关键修复）
function setItemRef(el: any, index: number) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

/**
 * 创建 Observer 实例
 */
function createObserver() {
  if (observer) return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // isIntersecting 为 true 时，触发加载更多事件
        if (entry.isIntersecting) {
          // 触发加载更多事件
          emit("loadMore");
          return;
        }
      });
    },
    {
      threshold: 0.5, // 50% 可见即触发，比 1 更友好
      rootMargin: "0px", // 提前 0px 触发，预加载
    },
  );
}

/**
 * 取消监听当前最后一个商品
 */
function unobserveLast() {
  if (curObservedEl && observer) {
    observer.unobserve(curObservedEl);
    curObservedEl = null;
  }
}

/**
 * 监听当前最后一个商品
 */
function observeLast() {
  if (!props.data.length || !observer) return;

  // 找到当前最后一个商品元素
  const lastIndex = props.data.length - 1;
  const lastEl = itemRefs.value[lastIndex];

  if (lastEl) {
    unobserveLast(); // 先取消旧的
    curObservedEl = lastEl;
    observer.observe(lastEl);
    console.log("开始监听第", lastIndex + 1, "个商品");
  }
}

// 监听数据变化，重新绑定监听
watch(
  () => [props.data.length, props.hasMore],
  ([newLength, newHasMore]) => {
    nextTick(() => {
      if (newHasMore) {
        // 首次加载更多商品时，创建 Observer
        createObserver();
        // 监听当前最后一个商品
        observeLast();
      } else {
        unobserveLast();
        console.log("取消监听当前最后一个商品");
      }
    });
  },
);

// 初始化
onMounted(() => {
  createObserver();
  observeLast();
});

// 清理
onUnmounted(() => {
  unobserveLast();
  observer?.disconnect();
  itemRefs.value = [];
});

defineExpose({});
</script>

<style scoped lang="scss">
.goodsItem {
  --w: 300px;
  width: var(--w);
  cursor: pointer; /* 鼠标悬停样式 */
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
</style>
