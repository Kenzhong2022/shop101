<template>
  <button @click="handlePay" class="btn-pay">立即支付</button>
</template>

<script setup>
const handlePay = async () => {
  try {
    // 1. 调用后端接口
    const res = await $fetch("/api/payment/alipay/create", {
      method: "POST",
      body: {
        orderId: "ORDER_20260315_" + Date.now(), // 你的真实订单号
        amount: 0.01,
        subject: "测试商品",
      },
    });

    if (res.success) {
      // 2. 将返回的 HTML 写入一个新窗口或 iframe
      // 这是支付宝官方推荐的页面跳转方式
      const win = window.open("", "_self");
      if (win) {
        win.document.write(res.data.html);
        win.document.close();
      } else {
        alert("请允许弹出窗口以进行支付");
      }
    }
  } catch (err) {
    console.error(err);
    alert("支付初始化失败");
  }
};
</script>
