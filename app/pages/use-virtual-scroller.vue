<!-- FixedList.vue -->
<template>
  <!-- 关键 1：容器必须给高度，否则会把整个列表当可视区 -->
  <div style="height: 100vh; display: flex; flex-direction: column">
    <h3>固定 80px 行高 —— 10000 条数据</h3>

    <!-- 关键 2：RecycleScroller 负责“可视区渲染 + DOM 复用” -->
    <RecycleScroller
      class="scroller"
      :items="list"
      :item-size="80"
      key-field="id"
      v-slot="{ item }"
    >
      {{ item.text }}
    </RecycleScroller>
  </div>
</template>

<script setup>
import { ref } from "vue";

const list = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `这是第 ${i} 条消息，内容长度固定`,
  }))
);
</script>

<style scoped>
.scroller {
  flex: 1;
  border: 1px solid #eee;
}
.row {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f2f2f2;
}
.id {
  font-weight: bold;
  margin-right: 12px;
}
</style>
