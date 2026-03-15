/** * 商品列表组件 */
<template>
  <div
    :ref="(el) => setItemRef(el, index)"
    class="p-2 box-border goodsItem"
    v-for="(goodsItem, index) in data"
    :key="goodsItem.id"
    @click.stop="handleClick(goodsItem)"
  >
    <div class="overflow-hidden relative w-fit" ref="goodsItemsRef">
      <!-- 加载动画 -->
      <kk-svg-loader-fast v-if="loading" :width="280" />
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
</template>

<script setup lang="ts">
import type { Goods } from "~~/server/api/goods/list.post";

const props = defineProps({
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

// 创建 Observer
function createObserver() {
  if (observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          emit("loadMore");
        }
      });
    },
    {
      threshold: 0.5, // 50% 可见即触发，比 1 更友好
      rootMargin: "100px", // 提前 100px 触发，预加载
    },
  );
}

// 取消监听
function unobserveLast() {
  if (curObservedEl && observer) {
    observer.unobserve(curObservedEl);
    curObservedEl = null;
  }
}

// 监听当前最后一个商品
function observeLast() {
  if (!props.data.length || !observer) return;

  // 找到当前最后一个商品元素
  const lastIndex = props.data.length - 1;
  const lastEl = itemRefs.value[lastIndex];

  if (lastEl) {
    unobserveLast(); // 先取消旧的
    curObservedEl = lastEl;
    observer.observe(lastEl);
    console.log("开始监听第", lastIndex, "个商品");
  }
}

// 监听数据变化，重新绑定监听
watch(
  () => props.data.length,
  () => {
    nextTick(() => {
      observeLast();
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
