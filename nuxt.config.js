import { defineNuxtConfig } from "nuxt/config";

// 无需手动导入 AutoImport、Components 和 ElementPlus 插件，@element-plus/nuxt 会自动处理

export default defineNuxtConfig({
  runtimeConfig: {
    // 服务端专属配置（仅服务端可访问，安全存储敏感信息）
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || 3306,
    NUXT_NEON_DATABASE_URL: process.env.NUXT_NEON_DATABASE_URL, // 这里才能被服务端读到
    HMAC_SECRET_KEY: process.env.HMAC_SECRET_KEY || "abc123",
    // 客户端可访问的配置（放这里会暴露给前端，数据库配置绝对不能放！）
    public: {
      // 比如前端需要的接口基础路径等，数据库相关一律不放这
    },
  },
  // 1. 关键 CSS 内联 + 其余样式异步
  experimental: {
    inlineSSRStyles: true, // 首屏样式直接塞进 <style>
    payloadExtraction: false, // 避免把样式再打一份 JSON
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  pages: true,

  // 1. 核心：指定公共目录为 app 之下的 public（相对于项目根目录）
  // dir: {
  //   public: "app/public", // 路径从 "public" 改为 "app/public"
  // },
  srcDir: "app/", // 确保你的目录结构是 app/ 下包含 assets、components 等

  app: {
    head: {
      // link: [
      //   {
      //     rel: "preconnect",
      //     href: "https://fonts.googleapis.com",
      //   },
      //   {
      //     rel: "preconnect",
      //     href: "https://fonts.gstatic.com",
      //     crossorigin: "",
      //   },
      //   {
      //     rel: "stylesheet",
      //     href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap",
      //   },
      // ],
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
  modules: ["@element-plus/nuxt", "@unocss/nuxt", "@nuxt/image"],

  // 图片优化模块配置
  image: {
    // 基础配置，使用默认 provider
    quality: 2,
    format: ["webp"], // 优先使用 WebP 格式
    lazy: true,
    // 预加载配置
    preload: true,
  },

  // 样式文件（确保路径正确，基于 srcDir: "app/"）
  css: [
    "@/assets/style/main.css", // 对应 app/assets/style/main.css
    // "./public/fonts/iconfont/iconfont.css", // 对应 app/public/fonts/... 迁移到插件导入
    // "@/assets/style/element/index.scss", // 自定义 Element 样式 迁移到插件导入
  ],

  // Vite 配置
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 标准化路径分隔符
            const normalizedId = id.replace(/\\/g, "/");

            // 1) 第三方库优化打包 - 基于项目实际依赖
            if (normalizedId.includes("node_modules")) {
              // UI框架相关
              if (normalizedId.includes("@element-plus") || normalizedId.includes("element-plus")) return "ui";
              
              // Vue生态
              if (normalizedId.includes("vue") && !normalizedId.includes("@vueuse")) return "vue-core";
              if (normalizedId.includes("vue-router")) return "vue-router";
              if (normalizedId.includes("@vueuse")) return "vue-use";
              
              // 工具库
              if (normalizedId.includes("lodash")) return "lodash";
              
              // 3D相关
              if (normalizedId.includes("three")) return "three";
              
              // 网络请求
              if (normalizedId.includes("axios") || normalizedId.includes("ofetch")) return "http";
              
              // 数据库相关
              if (normalizedId.includes("@neondatabase") || normalizedId.includes("@netlify/neon")) return "db";
              
              // 认证相关
              if (normalizedId.includes("jsonwebtoken") || normalizedId.includes("bcrypt") || normalizedId.includes("cookie")) return "auth";
              
              // 其他常用库
              return "vendor";
            }

            // 2) 业务代码按功能模块分包
            // 核心页面
            if (normalizedId.includes("/pages/index")) return "page-home";
            if (normalizedId.includes("/pages/user")) return "page-user";
            if (normalizedId.includes("/pages/cart")) return "page-cart";
            if (normalizedId.includes("/pages/login")) return "page-auth";
            
            // 商品相关页面
            if (normalizedId.includes("/pages/category")) return "page-category";
            if (normalizedId.includes("/pages/howToChooseStyle")) return "page-style-guide";
            
            // 帮助页面
            if (normalizedId.includes("/pages/help")) return "page-help";

            // 3) 组件和工具代码分包
            // 全局组件
            if (normalizedId.includes("/components/App")) return "comp-global";
            if (normalizedId.includes("/components/kk-")) return "comp-kk";
            
            // 通用工具
            if (normalizedId.includes("/composables")) return "shared-composables";
            if (normalizedId.includes("/utils")) return "shared-utils";
            
            // 布局组件
            if (normalizedId.includes("/layouts")) return "layouts";
            
            // 插件代码
            if (normalizedId.includes("/plugins")) return "plugins";

            // 4) 默认返回 - 其他业务代码
            return "business";
          },
        },
      },
    },

    plugins: [
      (await import("vite-plugin-image-optimizer")).ViteImageOptimizer({
        // 1. 启用/禁用开关（核心）
        disable: process.env.NODE_ENV === "development" ? false : false,
        // 开发环境：false=启用压缩（可预览），true=禁用（默认，提效）
        // 生产环境：建议false=强制压缩（优化体积）

        // 2. 各格式图片压缩规则（按需调整）
        png: {
          quality: 2, // 压缩质量（0-100，越高越清晰但体积大）
          speed: 4, // 压缩速度（1-11，1最快质量差，11最慢质量好）
        },
        jpeg: {
          quality: 2, // 压缩质量
          progressive: true, // 渐进式加载（提升用户体验）
        },
        webp: {
          quality: 2,
          lossless: false, // false=有损压缩（体积更小），true=无损压缩（质量不变）
        },
        avif: {
          quality: 2, // AVIF格式压缩效率更高，可适当降低质量
          lossless: false,
        },
        svg: {
          multipass: true, // 多次优化SVG，提升压缩比
          plugins: [
            { name: "removeViewBox", active: false }, // 保留viewBox（避免SVG变形）
            { name: "removeEmptyAttrs", active: true }, // 移除空属性
          ],
        },
        gif: {
          optimizationLevel: 3, // 优化等级（1-3，3最优）
        },

        // 关键修改：匹配项目内所有目录的目标格式图片（去掉 assets/public 目录限制）
        include: /\.(png|jpe?g|webp|avif|svg|gif)$/i,
        exclude: /node_modules/, // 可保留排除规则，避免处理依赖包图片
        // 6. 日志配置（可选，调试用）
        verbose: true, // 构建时打印压缩日志（如压缩比例、文件路径）
      }),
    ],
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
    // 关键：不要让它额外挂 link 标签
    injectStyles: false, // 默认 true → 会外链
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
