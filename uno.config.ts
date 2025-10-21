/**
 * UnoCSS 配置文件
 *
 * 功能说明：
 * 1. 预设配置 - 集成常用的原子化CSS预设
 * 2. 主题定制 - 自定义颜色、断点等设计系统
 * 3. 规则扩展 - 创建自定义工具类
 * 4. 快捷方式 - 定义常用的类组合
 * 5. 安全列表 - 确保重要类始终可用
 *
 * 使用方法：
 * - 在组件中直接使用原子类：class="bg-el-primary text-white p-4"
 * - 使用自定义颜色：class="bg-primary-500 hover:bg-primary-600"
 * - 响应式设计：class="text-sm md:text-lg lg:text-xl"
 * - 使用快捷方式：class="color-card color-swatch"
 * - 动态颜色预览：class="color-preview-red"
 */

import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
} from "unocss";

export default defineConfig({
  // 预设配置 - 核心功能模块
  presets: [
    // Uno 预设 - 提供最常用的原子化工具类
    // 包含：布局、间距、颜色、排版、边框、阴影等
    presetUno(),

    // 属性化预设 - 支持属性语法
    // 示例：<div bg-red-500 text-white p-4></div>
    presetAttributify(),

    // 图标预设 - 支持图标类名
    // 示例：class="i-carbon-sun i-carbon-moon"
    presetIcons({
      scale: 1.2, // 图标缩放比例
      warn: true, // 缺少图标时显示警告
    }),
  ],

  // 主题配置 - 自定义设计系统
  theme: {
    // 颜色系统 - 扩展UnoCSS的默认颜色
    colors: {
      // 自定义主色调 - 完整的色阶系统 (基于#ff5000主题色)
      // 使用方法：class="bg-primary-500 text-primary-600 border-primary-300"
      primary: {
        50: "#fff5f0", // 最浅色调 - 基于#ff5000的淡色
        100: "#ffe8d9", // 浅色调
        200: "#ffd1b3", // 较浅色调
        300: "#ffb380", // 中等浅色调
        400: "#ff8c4d", // 中等色调
        500: "#ff5000", // 基础色调 - 主题色
        600: "#e64a00", // 较深色调
        700: "#cc4200", // 深色调
        800: "#b33a00", // 更深色调
        900: "#993200", // 最深色调
      },

      // Element Plus 主题色集成
      // 与Element Plus组件库保持一致的设计系统
      "el-primary": "#ff5000", // 主品牌色 - 橙色
      "el-success": "#67c23a", // 成功状态色 - 绿色
      "el-warning": "#e6a23c", // 警告状态色 - 黄色
      "el-danger": "#f56c6c", // 危险状态色 - 红色
      "el-info": "#909399", // 信息状态色 - 灰色
    },

    // 响应式断点 - 移动优先的响应式设计
    // 使用方法：class="text-sm md:text-lg lg:text-xl"
    breakpoints: {
      xs: "320px", // 超小屏 - 手机竖屏
      sm: "640px", // 小屏 - 手机横屏
      md: "768px", // 中屏 - 平板
      lg: "1024px", // 大屏 - 笔记本
      xl: "1280px", // 超大屏 - 桌面显示器
      "2xl": "1536px", // 超超大屏 - 大型显示器
    },
  },

  // 自定义规则 - 创建特殊的工具类
  rules: [
    // 颜色预览工具类 - 生成颜色小圆点
    // 使用方法：class="color-preview-red" 或 class="color-preview-#ff0000"
    [
      /^color-preview-(.*)$/,
      ([, color]) => ({
        "background-color": color, // 背景色设置为指定颜色
        width: "20px", // 宽度20像素
        height: "20px", // 高度20像素
        "border-radius": "50%", // 圆形显示
        display: "inline-block", // 行内块级元素
        "margin-right": "8px", // 右侧间距8像素
        border: "1px solid #ddd", // 1像素灰色边框
      }),
    ],

    // 主题色文字规则 - text-primary 渲染为 #ff5000
    // 使用方法：class="text-primary"
    [
      "text-primary",
      {
        color: "#ff5000", // 主题色，与Element Plus主色调保持一致
      },
    ],
  ],

  // 快捷方式 - 定义常用的类组合
  // 简化复杂样式的书写，提高开发效率
  shortcuts: {
    // 颜色预览卡片 - 用于展示颜色样本
    "color-card": "p-4 rounded-lg shadow-sm border border-gray-200",

    // 颜色样本 - 用于显示颜色块
    "color-swatch": "w-12 h-12 rounded-md border border-gray-300",

    // 颜色名称 - 颜色标签文本样式
    "color-name": "text-sm font-medium text-gray-700 mt-2",

    // 颜色代码 - 颜色值文本样式
    "color-code": "text-xs text-gray-500 font-mono",
  },

  // 安全列表 - 防止未使用的类被Tree-shaking移除
  // 确保这些重要的类始终可用，即使代码中没有直接引用
  safelist: [
    // Element Plus 主题色类
    "bg-el-primary",
    "text-el-primary",
    "border-el-primary",
    "bg-el-success",
    "text-el-success",
    "border-el-success",
    "bg-el-warning",
    "text-el-warning",
    "border-el-warning",
    "bg-el-danger",
    "text-el-danger",
    "border-el-danger",
    "bg-el-info",
    "text-el-info",
    "border-el-info",

    // 主色调色阶类 - 完整的主题色系统
    "bg-primary-500",
    "text-primary-500",
    "border-primary-500",
    "bg-primary-600",
    "text-primary-600",
    "border-primary-600",
    "bg-primary-700",
    "text-primary-700",
    "border-primary-700",
    "bg-primary-400",
    "text-primary-400",
    "border-primary-400",
    "bg-primary-300",
    "text-primary-300",
    "border-primary-300",

    // 主题色快捷类
    "text-primary", // 新增的主题色文字类

    // 颜色预览工具类
    "color-preview-red",
    "color-preview-blue",
    "color-preview-green",
    "color-preview-yellow",
    "color-preview-purple",
    "color-preview-pink",
    "color-preview-indigo",
    "color-preview-gray",
  ],
});
