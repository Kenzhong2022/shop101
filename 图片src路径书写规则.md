# 图片 src 路径书写规则

在 Nuxt.js 项目中，图片存放位置不同会导致 src 路径书写方式完全不同。错误的写法会导致 404 错误或图片无法显示。

## 两种图片存放位置

### 1. assets 目录 (app/assets/)
- **路径**: `app/assets/img/`
- **特点**: 会被 webpack 处理，支持优化和哈希
- **适用场景**: 项目内部使用的图片，需要构建优化

### 2. public 目录 (public/)
- **路径**: `public/img/`
- **特点**: 静态资源，直接复制到输出目录
- **适用场景**: 需要固定路径访问的图片，如 favicon、robots.txt

## 路径书写规则对比

### ✅ 正确写法

#### 图片在 assets 目录时：
```vue
<!-- 方式1: 使用 import 导入 -->
<script setup>
import banner1 from '@/assets/img/banners/banner1.png'
</script>
<template>
  <img :src="banner1" alt="banner1" />
</template>

<!-- 方式2: 使用 require -->
<img :src="require('@/assets/img/banners/banner1.png')" alt="banner1" />

<!-- 方式3: 使用 NuxtImg 组件 -->
<NuxtImg src="/img/banners/banner1.png" alt="banner1" />
```

#### 图片在 public 目录时：
```vue
<!-- 直接使用绝对路径 -->
<img src="/img/banners/banner1.png" alt="banner1" />

<!-- 使用 NuxtImg 组件 -->
<NuxtImg src="/img/banners/banner1.png" alt="banner1" />
```

### ❌ 错误写法（会导致报错）

```vue
<!-- 错误1: 在 assets 目录使用绝对路径 -->
<img src="/app/assets/img/banners/banner1.png" alt="banner1" />
<!-- 结果: 404 错误，因为构建后不存在这个路径 -->

<!-- 错误2: 混用路径 -->
<img src="assets/img/banners/banner1.png" alt="banner1" />
<!-- 结果: 路径解析错误 -->

<!-- 错误3: 使用相对路径 -->
<img src="../assets/img/banners/banner1.png" alt="banner1" />
<!-- 结果: 在不同页面路径会失效 -->
```

## 为什么不同的写法会导致错误？

### 1. Webpack 处理方式不同
- **assets 目录**: 图片会被 webpack 处理，文件名会添加哈希值
  - 原始文件: `banner1.png`
  - 构建后: `banner1.a1b2c3.png`
  - 直接访问 `/app/assets/img/banners/banner1.png` 会 404

- **public 目录**: 文件直接复制，保持原始路径
  - 构建后仍然可以通过 `/img/banners/banner1.png` 访问

### 2. 路径解析机制
- **import/require**: webpack 会在编译时解析正确的路径
- **绝对路径**: 基于服务器根目录，需要确保文件真实存在
- **相对路径**: 基于当前页面 URL，容易出错

## 最佳实践建议

### 1. 统一使用 import 导入（推荐）
```vue
<script setup>
// 在 script setup 中导入图片
import banner1 from '@/assets/img/banners/banner1.png'
import banner2 from '@/assets/img/banners/banner2.png'

const banners = [
  { id: 1, title: 'banner1', image: banner1 },
  { id: 2, title: 'banner2', image: banner2 }
]
</script>

<template>
  <img v-for="banner in banners" :key="banner.id" :src="banner.image" :alt="banner.title" />
</template>
```

### 2. 使用 NuxtImg 组件
```vue
<template>
  <!-- 自动优化，支持响应式 -->
  <NuxtImg src="/img/banners/banner1.png" alt="banner1" loading="lazy" />
</template>
```

### 3. 路径别名配置
在 `nuxt.config.js` 中配置别名：
```javascript
export default defineNuxtConfig({
  alias: {
    '@img': '/assets/img'
  }
})
```

## 快速排查清单

- [ ] 图片是否在正确的目录？
- [ ] 使用 import 还是直接路径？
- [ ] 路径是否以 `/` 开头？（仅 public 目录）
- [ ] 是否使用了正确的别名？
- [ ] 构建后文件名是否改变？

## 常见错误及解决方案

| 错误现象 | 原因 | 解决方案 |
|---------|------|----------|
| 404 错误 | 路径不正确 | 检查图片是否在指定目录 |
| 图片不显示 | 使用了错误的路径格式 | 根据目录类型使用正确语法 |
| 构建失败 | import 路径错误 | 确保文件真实存在 |
| 缓存问题 | 文件名未改变 | 使用 assets 目录让 webpack 添加哈希 |

记住：**assets 目录用 import，public 目录用绝对路径**