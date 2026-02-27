<!-- 商品操作 -->
<template>
  <div
    class="goods-operation-container fixed left-[calc(50%+800px-600px/2-16px-24px)] -translate-x-1/2 w-[600px] bottom-0 z-999 flex justify-start items-center p-24px gap-12px"
  >
    <div class="flex flex-row flex-1 justify-center items-center text-white">
      <div
        class="flex-1 px-12px py-6px text-center add-cart rounded-l-8px"
        @click="addCart"
      >
        加入购物车
      </div>
      <div
        class="flex-[4] px-12px py-6px text-center bg-primary rounded-r-8px"
        @click="buyNow"
      >
        立即购买
      </div>
    </div>
    <div @click="toggleCollect">
      <el-icon color="var(--el-color-primary)">
        <StarFilled v-if="isCollect" />
        <Star v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, StarFilled } from "@element-plus/icons-vue";
const isCollect = ref(false);
function toggleCollect() {
  isCollect.value = !isCollect.value;
}

function addCart() {
  cartStore.addCart({
    goodsId: Number(goodsId),
    count: 1,
  });
}

function buyNow() {
  cartStore.addCart({
    goodsId: Number(goodsId),
    count: 1,
  });
}
</script>

<style scoped lang="scss">
.goods-operation-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1);
}
.add-cart {
  background: linear-gradient(
    to right,
    #ffd700,
    var(--el-color-primary-light-3)
  );
}
</style>
