<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">小巧的风格 - 中性款</h1>
    <p class="text-gray-600 mb-8">
      中性款风格适合小巧身材的人群，通过简约的设计、宽松的剪裁和中性的色彩，展现个性与独立的时尚态度。
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 风格特点 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
        <h3 class="text-xl font-semibold mb-3">中性款风格特点</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>简约的色彩（黑、白、灰、卡其等）</li>
          <li>宽松但有版型的剪裁</li>
          <li>无明显性别特征的设计元素</li>
          <li>注重材质和质感的表达</li>
        </ul>
      </div>

      <!-- 推荐搭配 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-black-400">
        <h3 class="text-xl font-semibold mb-3">推荐搭配</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>宽松的白衬衫 + 直筒牛仔裤</li>
          <li>休闲西装外套 + 阔腿裤</li>
          <li>卫衣 + 工装裤</li>
          <li>简约的帽子、围巾等配饰</li>
        </ul>
      </div>
    </div>

    <!-- 相关链接 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">相关风格推荐</h3>
      <div
        class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="$router.push('/category/outfitsOfStyle/asia/japaneseStyle')"
      >
        <p class="text-gray-700">查看日式穿搭详情 →</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 定义页面元数据
  definePageMeta({
    title: "小巧的风格 - 中性款",
  });
</script>

<style scoped>
  /* 页面特定样式 */
</style>
