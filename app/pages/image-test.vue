<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">图片优化测试</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 原始图片 -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">原始 img 标签</h2>
        <img
          src="/img/banners/banner1.png"
          alt="原始图片"
          class="w-full h-auto"
        />
        <p class="text-sm text-gray-600">文件大小: ~9.5MB (原始大小)</p>
      </div>

      <!-- 优化后的图片 -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">NuxtImg 优化</h2>
        <NuxtImg 
          src="/img/banners/banner1.png" 
          alt="优化图片"
          class="w-full h-auto"
          loading="lazy"
        />
        <p class="text-sm text-gray-600">文件大小: 大幅减少 (自动优化)</p>
      </div>
    </div>

    <!-- 响应式图片示例 -->
    <div class="mt-12 space-y-4">
      <h2 class="text-xl font-semibold">响应式图片</h2>
      <NuxtImg
        src="/img/banners/banner2.png"
        alt="响应式图片"
        class="w-full h-auto"
        loading="lazy"
      />
      <p class="text-sm text-gray-600">根据屏幕尺寸自动调整图片大小</p>
    </div>

    <!-- 优化对比 -->
    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <h3 class="text-lg font-medium">原始 JPEG</h3>
        <img 
          src="/img/banners/写真杂志1.jpeg"
          class="w-full h-48 object-cover"
        />
      </div>
      
      <div class="space-y-2">
        <h3 class="text-lg font-medium">NuxtImg 优化</h3>
        <NuxtImg 
          src="/img/banners/写真杂志1.jpeg"
          class="w-full h-48 object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// 图片优化测试页面
// 访问 /image-test 查看效果
</script>
