<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">小巧的风格 - 温柔款</h1>
    <p class="text-gray-600 mb-8">
      温柔款风格适合小巧身材的人群，通过柔和的色彩、轻盈的面料和精致的细节，展现女性的柔美与温柔气质。
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 风格特点 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-400">
        <h3 class="text-xl font-semibold mb-3">温柔款风格特点</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>柔和的色彩（粉色、浅蓝、米色等）</li>
          <li>轻盈的面料（雪纺、薄纱、丝绸等）</li>
          <li>精致的细节（蕾丝、刺绣、荷叶边等）</li>
          <li>合身但不紧身的剪裁</li>
        </ul>
      </div>

      <!-- 推荐搭配 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-400">
        <h3 class="text-xl font-semibold mb-3">推荐搭配</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>浅色系连衣裙 + 细高跟鞋</li>
          <li>高腰A字裙 + 修身针织衫</li>
          <li>轻薄开衫 + 吊带背心 + 阔腿裤</li>
          <li>精致的项链、耳环等配饰</li>
        </ul>
      </div>
    </div>

    <!-- 相关链接 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">相关风格推荐</h3>
      <div
        class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="$router.push('/category/outfitsOfStyle/asia/koreanStyle')"
      >
        <p class="text-gray-700">查看韩式穿搭详情 →</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 定义页面元数据
  definePageMeta({
    title: "小巧的风格 - 温柔款",
  });
</script>

<style scoped>
  /* 页面特定样式 */
</style>
