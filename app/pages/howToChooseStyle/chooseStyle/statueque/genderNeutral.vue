<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">高挑的风格 - 中性款</h1>
    <p class="text-gray-600 mb-8">
      中性款风格适合高挑身材的人群，通过宽松的设计、休闲的剪裁和活力的配色，展现美式街头风格的活力与个性。
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 风格特点 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-400">
        <h3 class="text-xl font-semibold mb-3">中性款风格特点</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>鲜明的色彩对比（如黑白配、红绿配等）</li>
          <li>宽松的剪裁和休闲的设计</li>
          <li>街头元素（如涂鸦、字母印花等）</li>
          <li>多种材质的混搭（牛仔、皮革、棉麻等）</li>
        </ul>
      </div>

      <!-- 推荐搭配 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-400">
        <h3 class="text-xl font-semibold mb-3">推荐搭配</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>宽松的卫衣 + 运动裤</li>
          <li>牛仔外套 + 破洞牛仔裤</li>
          <li>连帽衫 + 工装裤</li>
          <li>棒球帽、运动鞋等街头风配饰</li>
        </ul>
      </div>
    </div>

    <!-- 相关链接 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">相关风格推荐</h3>
      <div
        class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="$router.push('/category/outfitsOfStyle/west/americanStyle')"
      >
        <p class="text-gray-700">查看美式穿搭详情 →</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 定义页面元数据
  definePageMeta({
    title: "高挑的风格 - 中性款",
  });
</script>

<style scoped>
  /* 页面特定样式 */
</style>
