// 只在客户端并且空闲后再加载
export default defineNuxtPlugin(() => {
  if (process.client) {
    requestIdleCallback(
      () => {
        // Element 完整样式
        import("../assets/style/element/index.scss");
        // 图标字体
        import("../public/fonts/iconfont/iconfont.css");
        import("vue-virtual-scroller/dist/vue-virtual-scroller.css");
      },
      { timeout: 1500 }
    );
  }
});
