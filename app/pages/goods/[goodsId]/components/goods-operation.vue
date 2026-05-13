<!-- 商品操作 -->
<template>
  <div
    class="goods-operation-container fixed left-[calc(50%+800px-600px/2-16px-24px)] -translate-x-1/2 w-[600px] bottom-0 z-999 flex justify-start items-center p-24px gap-12px"
  >
    <div
      class="h-45px flex flex-row flex-1 justify-center items-center text-white hover:cursor-pointer"
    >
      <div
        class="h-full line-height-45px px-12px py-6px text-center add-cart rounded-l-8px iconfont icon-cart1"
        @click="addCart"
        style="flex: 1 0 0"
      ></div>
      <div
        class="h-full line-height-45px px-12px py-6px text-center bg-primary rounded-r-8px"
        @click="buyNow"
        style="flex: 4 0 0"
      >
        立即购买
      </div>
    </div>
    <div @click="changeFav">
      <el-icon color="var(--el-color-primary)">
        <StarFilled v-if="isFav" />
        <Star v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Star, StarFilled } from "@element-plus/icons-vue";
import type { CartAddRequest, CartAddResponse } from "~~/server/types/cart";
import type {
  userBehaviorProductsGetRequest,
  userBehaviorProductsGetResponse,
} from "~~/server/types/user-behavior";
import {
  userBehaviorProductsGet,
  userBehaviorProductsDelete,
} from "~/api/user-behavior/products";
import { useProductBehavior } from "~/composables/useProductBehavior";
import { useUser } from "~/composables/useUser";
import { useCartStore } from "~/stores/cart";
const userState = useUser();
const { $message } = useNuxtApp();
const cartStore = useCartStore();
const props = defineProps({
  goodsId: {
    type: Number,
    required: true,
  },
  currentSku: {
    type: Object,
    required: true,
  },
  skuCode: {
    type: String,
    required: true,
  },
});
const favRes = ref<userBehaviorProductsGetResponse>();
const isFav = ref(false);

onMounted(async () => {
  // 检查用户是否收藏了该商品 tokenExpried()
  if (tokenExpried()) {
    favRes.value = await userBehaviorProductsGet({
      productId: props.goodsId,
    });
    if (favRes.value.data) {
      isFav.value = true;
    }
  }
});
/**
 * 切换收藏状态
 */
function changeFav() {
  // 检查用户是否登录
  if (userState.value.userId == -1) {
    $message.warning("请先登录");
    return;
  }
  // 切换收藏状态
  if (isFav.value && favRes.value?.data?.id) {
    // 取消收藏
    userBehaviorProductsDelete({
      productIds: [favRes.value?.data?.id],
      action_type: 2,
    });
    isFav.value = false;
    $message.success("取消收藏成功");
  } else {
    // 收藏商品
    useProductBehavior(props.goodsId, {
      behaviorType: "fav",
    });
    isFav.value = true;
    $message.success("收藏成功");
  }
}

function addCart() {
  // 检查用户是否登录
  if (userState.value.userId == -1) {
    $message.warning("请先登录");
    return;
  }
  if (!props.currentSku.sku_code) {
    $message.warning("请选择商品规格");
    return;
  }
  // 传给 useProductBehavior
  useProductBehavior(props.goodsId, {
    behaviorType: "cart",
  });
  cartStore.addCart({
    goods_id: props.goodsId,
    quantity: 1,
    sku_code: props.currentSku.sku_code,
    sku_value: props.currentSku.sku_value,
  });
}

function buyNow() {
  // 检查用户是否登录
  if (userState.value.userId == -1) {
    $message.warning("请先登录");
    return;
  }
  console.log(userState.value, 123);
  cartStore.addCart({
    goods_id: props.goodsId,
    quantity: 1,
    sku_value: props.currentSku.sku_value,
    sku_code: props.currentSku.sku_code,
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
