import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  pages: true,
  srcDir: "app/",

  // 模块配置
  modules: ["@element-plus/nuxt", "@unocss/nuxt"],

  // Element Plus 样式
  css: [
    // "~/assets/style/element-variables.scss", // 全局使用变量
    "@/assets/style/main.css", // 主样式文件
    "@/public/fonts/iconfont/iconfont.css", // 图标字体样式
    "@/assets/style/element/index.scss", // Element Plus自定义主题
  ],

  // Vite构建配置
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
                    @use "@/assets/style/element-variables.scss" as element;
                    `,
        },
      },
    },
  },

  elementPlus: {
    importStyle: "scss",
  },

  // 组件自动导入
  components: {
    dirs: ["~/components"],
    global: true,
  },
});
