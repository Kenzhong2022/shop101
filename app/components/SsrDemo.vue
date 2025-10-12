<!--
  文件路径: components/SsrDemo.vue
  文件用途: 这是一个封装了 SSR 教学案例的组件，用于演示在 Nuxt 中如何正确处理客户端代码。
-->
<!--
  UnoCSS 原子化 CSS 使用说明 (初学者入门):

  下面的 HTML 模板中，您会看到大量的 class，例如 `m-8`, `p-6`, `text-sm` 等。这就是原子化 CSS。
  每一个 class 都代表一个独立的、单一的 CSS 规则。这种写法的核心思想是“关注点分离”，将样式直接写在 HTML 结构上。

  - 规则解读:
    - `m-8`: 代表 `margin: 2rem;`。UnoCSS 默认的单位是 0.25rem，所以 8 * 0.25rem = 2rem。
    - `p-6`: 代表 `padding: 1.5rem;` (6 * 0.25rem = 1.5rem)。
    - `mt-0`, `mb-4`: `m` 代表 margin，`t` 代表 top，`b` 代表 bottom。所以这两个分别代表 `margin-top: 0;` 和 `margin-bottom: 1rem;`。
    - `text-sm`, `text-2xl`: `text` 前缀用于控制字体大小。`sm` 代表 small，`2xl` 代表 2x-large。
    - `text-gray-600`, `bg-gray-100`: `text` 和 `bg` 分别控制文字颜色和背景颜色。后面的 `gray-600` 是预设的颜色名。
    - `border-t-2`: `border` 控制边框，`t` 代表 top，`2` 代表宽度。所以这是 `border-top-width: 2px;`。
    - `rounded-lg`: 控制圆角大小，`lg` 代表 large。
    - `font-sans`: 设置字体为无衬线字体 (sans-serif)。
    - `font-bold`: 设置字体为粗体。
    - `max-w-800px`: 设置 `max-width: 800px;`。

  通过组合这些原子类，我们可以快速构建出复杂的 UI 界面，而无需编写一行额外的 CSS 代码。
-->
<template>
  <div
    class="border-t-2 border-t-solid border-t-[#00dc82] m-8 p-6 bg-gray-100 rounded-lg font-sans text-gray-800"
  >
    <h2 class="text-999 mt-0 mb-4">SSR 客户端/服务器端代码教学案例</h2>
    <p class="text-sm max-w-800px">
      这个案例将向您展示在 Nuxt (SSR) 环境下，处理浏览器专属代码（如 `window`
      对象）的正确与错误方法。
    </p>

    <div class="bg-white border border-gray-200 p-4 px-6 rounded-md my-6">
      <h3>当前获取到的浏览器窗口宽度是:</h3>
      <p class="text-2xl font-bold text-[#00dc82] my-2">{{ screenWidth }}</p>
    </div>

    <div class="bg-[#fffbe5] border border-[#ffde5c] p-6 rounded-md">
      <h4 class="mt-0 text-[#8c6d00]">发生了什么？</h4>
      <p>
        当前已激活 <b>“正确示范”</b>。代码现在被包裹在 `onMounted`
        钩子中，这意味着它只会在浏览器中执行。
      </p>
      <p>
        您可以在 <b>浏览器控制台</b> 中看到 `"✅ 正确示范：这段代码只在浏览器中运行"`
        的日志。应用现在可以正常工作并显示窗口宽度。
      </p>
      <h4 class="mt-4 text-[#8c6d00]">如何切换回“错误示范”？</h4>
      <ol class="pl-5">
        <li class="mb-2">进入本组件 (`components/SsrDemo.vue`) 的 `script setup` 区域。</li>
        <li class="mb-2">将 <b>“正确示范”</b> 的代码块整个用 `/*` 和 `*/` 注释起来。</li>
        <li class="mb-2">将 <b>“错误示范”</b> 的代码块的注释 `/*` 和 `*/` 去掉。</li>
        <li>保存文件，然后重启您的开发服务器 (重新运行 `npm run dev`)。</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";

  // 定义一个响应式变量来存储屏幕宽度。
  const screenWidth = ref(0);

  // =================================================================
  // ====================== 错误示范 (当前已禁用) ======================
  // =================================================================
  /*
  // 【当前此代码块已被注释，不会执行】
  // 这段代码会先在服务器上执行
  console.log('❌ 错误示范：这段代码在服务器端执行了！'); // 这条日志会打印在你的 *终端* 里

  // 错误原因: 服务器 (Node.js) 环境没有 `window` 对象，所以下一行会直接导致应用崩溃。
  // const width = window.innerWidth;
  // screenWidth.value = width;
*/

  // =================================================================
  // ====================== 正确示范 (当前已激活) ======================
  // =================================================================

  // 【当前此代码块已生效，应用可以正常工作】

  // 正确原因:
  // `onMounted` 钩子确保了内部的代码只会在组件挂载到浏览器之后才执行，完美避开了服务器端。
  onMounted(() => {
    console.log("✅ 正确示范：这段代码只在浏览器中运行"); // 这条日志会打印在你的 *浏览器控制台* 里

    // 这里的代码是安全的，因为它 100% 只在浏览器中运行。
    screenWidth.value = window.innerWidth;

    // 添加一个事件监听器，让它在窗口大小改变时动态更新。
    window.addEventListener("resize", () => {
      console.log("窗口大小正在改变..."); // 这条日志也会打印在 *浏览器控制台* 里
      screenWidth.value = window.innerWidth;
    });
  });
</script>
