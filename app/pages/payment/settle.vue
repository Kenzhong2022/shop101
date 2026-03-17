/** * 结算页面 */
<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h1 class="text-2xl font-bold text-gray-900">订单结算</h1>
        <p class="text-gray-600 mt-2">请确认订单信息并完成支付</p>
      </div>

      <!-- 订单信息 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">订单详情</h2>

        <!-- 商品列表 -->
        <div class="space-y-4">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="flex items-center justify-between border-b pb-4"
          >
            <div class="flex items-center">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-16 h-16 rounded-lg object-cover mr-4"
              />
              <div>
                <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
                <p class="text-gray-600 text-sm">数量: {{ item.quantity }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </p>
              <p class="text-gray-600 text-sm">单价: ¥{{ item.price }}</p>
            </div>
          </div>
        </div>

        <!-- 总价 -->
        <div class="flex justify-between items-center pt-4">
          <span class="text-lg font-semibold text-gray-900">总计:</span>
          <span class="text-2xl font-bold text-primary"
            >¥{{ totalAmount.toFixed(2) }}</span
          >
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <button
          @click="handleCreateOrder"
          :disabled="loading"
          class="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "处理中..." : "立即支付" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ name: "settle" });

const { $message } = useNuxtApp();
const router = useRouter();
const loading = ref(false);

// 订单数据（从购物车获取）
const orderItems = ref([
  {
    id: 1,
    name: "测试商品1",
    price: 0.01,
    quantity: 1,
    image: "https://via.placeholder.com/150",
  },
]);

const totalAmount = computed(() => {
  return orderItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
});

// 创建订单
async function handleCreateOrder() {
  try {
    loading.value = true;

    // 调用创建订单API
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user123", // TODO: 从用户信息获取
        items: orderItems.value.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalAmount.value,
        subject: "ChainPay订单",
      }),
    });

    const result = await response.json();

    if (result.success) {
      $message.success("订单创建成功，正在跳转到支付...");

      // 创建支付
      await createPayment(result.data.orderId, result.data.order.amount);
    } else {
      $message.error(result.message || "订单创建失败");
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    $message.error("订单创建失败，请重试");
  } finally {
    loading.value = false;
  }
}

// 创建支付
async function createPayment(orderId: string, amount: number) {
  try {
    const response = await fetch("/api/payment/alipay/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: amount,
        subject: "ChainPay订单支付",
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 写入支付表单HTML，跳转到支付宝
      document.write(result.data.html);
    } else {
      $message.error(result.message || "支付创建失败");
    }
  } catch (error) {
    console.error("创建支付失败:", error);
    $message.error("支付创建失败，请重试");
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
