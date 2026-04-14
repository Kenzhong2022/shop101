// types/page-meta.d.ts
export {};

declare module "#app" {
  interface PageMeta {
    /**
     * 自定义布局配置项
     */
    layoutOptions: {
      /**
       * 是否启用粘性模式
       */
      isStickyMode?: boolean;
      /**
       * 是否显示搜索框
       */
      showSearch?: boolean;
    };
  }
}
