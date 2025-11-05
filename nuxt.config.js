import { defineNuxtConfig } from "nuxt/config";

// 无需手动导入 AutoImport、Components 和 ElementPlus 插件，@element-plus/nuxt 会自动处理

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  pages: true,
  srcDir: "app/", // 确保你的目录结构是 app/ 下包含 assets、components 等

  app: {
    head: {
      script: [
        {
          // 引入 ColorThief 库
          src: "https://cdn.jsdelivr.net/npm/colorthief@2.3.2/dist/color-thief.umd.js",
          defer: true, // 异步加载，不阻塞渲染
        },
      ],
    },
  },

  // 模块配置（核心：仅保留 @element-plus/nuxt 和 @unocss/nuxt）
  modules: ["@element-plus/nuxt", "@unocss/nuxt"],

  // 样式文件（确保路径正确，基于 srcDir: "app/"）
  css: [
    "@/assets/style/main.css", // 对应 app/assets/style/main.css
    "@/public/fonts/iconfont/iconfont.css", // 对应 app/public/fonts/...
    "@/assets/style/element/index.scss", // 自定义 Element 样式
  ],

  // Vite 配置（移除重复的插件，只保留必要的预处理器配置）
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/style/element-variables.scss" as element;
          `, // 引入自定义变量（用于主题定制）
        },
      },
    },
  },

  // Element Plus 模块配置（由 @element-plus/nuxt 提供）
  elementPlus: {
    importStyle: "scss", // 配合 scss 预处理器
    autoImport: true, // 自动导入组件和 API（模块已集成，无需手动配置）
    icons: {
      autoImport: true, // 自动导入图标
    },
    globalConfig: {
      size: "small",
      zIndex: 3000,
    },
    // cache: true, // 开启缓存
  },

  // 组件自动导入（Nuxt 原生配置，无需与 unplugin 重复）
  components: {
    dirs: ["~/components"], // 对应 app/components
    global: true,
  },
  composables: ["~/composables/tools"],
});
