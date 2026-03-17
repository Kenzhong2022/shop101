<template>
  <div class="payment-result">
    <div class="result-container">
      <div class="result-icon">
        <div v-if="isSuccess" class="success-icon">✅</div>
        <div v-else class="error-icon">❌</div>
      </div>

      <h1 class="result-title">
        {{ isSuccess ? "支付成功" : "支付失败" }}
      </h1>

      <div class="result-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">交易号：</span>
          <span class="value">{{ tradeNo || "暂无" }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付金额：</span>
          <span class="value">¥{{ totalAmount }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付时间：</span>
          <span class="value">{{ timestamp }}</span>
        </div>
      </div>

      <div class="result-actions">
        <button @click="goHome" class="btn btn-primary">返回首页</button>
        <button @click="goOrder" class="btn btn-secondary">查看订单</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 将 layout 设置为 false，表示不使用任何布局
definePageMeta({
  layout: false,
});
const route = useRoute();
const router = useRouter();

// 从URL参数获取支付结果信息
const orderId = computed(() => route.query.out_trade_no || "");
const tradeNo = computed(() => route.query.trade_no || "");
const totalAmount = computed(() => route.query.total_amount || "0.00");
const timestamp = computed(
  () => route.query.timestamp || new Date().toLocaleString(),
);

// 简单的支付状态判断（实际应该调用后端验证接口）
const isSuccess = computed(() => {
  // 如果有trade_no，一般表示支付成功
  return (
    !!tradeNo.value && route.query.method === "alipay.trade.page.pay.return"
  );
});

const goHome = () => {
  router.push("/");
};

const goOrder = () => {
  router.push("/user/myUser?tab=myOrder");
};

// 页面加载时验证支付结果
onMounted(async () => {
  console.log("支付结果页面加载，参数：", route.query);

  // 实际项目中应该调用后端验证接口
  // try {
  //   const result = await $fetch('/api/payment/alipay/verify', {
  //     method: 'POST',
  //     body: {
  //       orderId: orderId.value,
  //       tradeNo: tradeNo.value
  //     }
  //   });
  //   // 根据验证结果处理
  // } catch (error) {
  //   console.error('支付验证失败:', error);
  // }
});
</script>

<style scoped>
.payment-result {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.result-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.result-icon {
  margin-bottom: 20px;
}

.success-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #333;
}

.result-info {
  margin-bottom: 30px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 400;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}
</style>
