<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">高挑的风格 - 温柔款</h1>
    <p class="text-gray-600 mb-8">
      温柔款风格适合高挑身材的人群，通过简约的设计、优雅的线条和精致的细节，展现法式风情的优雅与气质。
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 风格特点 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-400">
        <h3 class="text-xl font-semibold mb-3">温柔款风格特点</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>简约的色彩（黑、白、米、浅灰等）</li>
          <li>流畅的线条和优雅的剪裁</li>
          <li>精致的细节（如领结、褶皱等）</li>
          <li>高品质的面料（如羊绒、真丝等）</li>
        </ul>
      </div>

      <!-- 推荐搭配 -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-400">
        <h3 class="text-xl font-semibold mb-3">推荐搭配</h3>
        <ul class="list-disc list-inside text-gray-700 space-y-2">
          <li>经典的小黑裙 + 高跟鞋</li>
          <li>白色衬衫 + 高腰阔腿裤</li>
          <li>针织毛衣 + 半身裙</li>
          <li>精致的丝巾、耳环等配饰</li>
        </ul>
      </div>
    </div>

    <!-- 相关链接 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">相关风格推荐</h3>
      <div
        class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
        @click="$router.push('/category/outfitsOfStyle/west/frenchStyle')"
      >
        <p class="text-gray-700">查看法式穿搭详情 →</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 定义页面元数据
  definePageMeta({
    title: "高挑的风格 - 温柔款",
  });
</script>

<style scoped>
  /* 页面特定样式 */
</style>
