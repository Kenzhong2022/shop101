// config/chunk-rules.ts
/**
 * 抽离的 manualChunks 分包规则
 * @param id 每个文件的路径（如 node_modules/@element-plus/index.js、pages/user/index.vue）
 * @returns 分包名称（如 chunk-element-plus、chunk-user）
 */
export const manualChunks = (id: string) => {
  // 标准化路径（兼容 Windows/Mac）
  const normalizedId = id.replace(/\\/g, "/");

  // --------------------------
  // 1. 第一优先级：第三方大库（体积大、更新慢）
  // --------------------------
  if (normalizedId.includes("node_modules")) {
    if (normalizedId.includes("@element-plus")) return "chunk-element-plus";
    if (normalizedId.includes("echarts")) return "chunk-echarts";
    if (normalizedId.includes("ant-design-vue")) return "chunk-antd";
    if (normalizedId.includes("vue") || normalizedId.includes("@vue"))
      return "chunk-vue";
    if (normalizedId.includes("vue-router") || normalizedId.includes("pinia"))
      return "chunk-vue-core";
    if (normalizedId.includes("lodash")) return "chunk-lodash";
    if (normalizedId.includes("axios")) return "chunk-axios";
    if (normalizedId.includes("dayjs")) return "chunk-dayjs";
    return "chunk-vendor";
  }

  // --------------------------
  // 2. 第二优先级：业务路由（按模块隔离，按需加载）
  // --------------------------
  if (
    normalizedId.includes("/pages/index") ||
    normalizedId.includes("/pages/home")
  )
    return "chunk-home";
  if (normalizedId.includes("/pages/user")) return "chunk-user";
  if (normalizedId.includes("/pages/order")) return "chunk-order";
  if (normalizedId.includes("/pages/admin")) return "chunk-admin";
  if (normalizedId.includes("/pages/report")) return "chunk-report";
  if (
    normalizedId.includes("/pages/setting") ||
    normalizedId.includes("/pages/profile")
  ) {
    return "chunk-settings";
  }

  // --------------------------
  // 3. 第三优先级：全局公共业务代码（复用性高）
  // --------------------------
  if (normalizedId.includes("/composables")) return "chunk-shared";
  if (normalizedId.includes("/utils")) return "chunk-shared";
  if (normalizedId.includes("/hooks")) return "chunk-shared";
  if (normalizedId.includes("/components/common")) return "chunk-shared";
  if (normalizedId.includes("/api")) return "chunk-shared-api";

  // --------------------------
  // 4. 第四优先级：特殊大文件（单独拆，避免污染其他 chunk）
  // --------------------------
  if (normalizedId.includes("/assets/large/")) return "chunk-large-assets";
  if (normalizedId.includes("/components/third-party/"))
    return "chunk-third-party";

  // --------------------------
  // 5. 默认：剩余零散小文件
  // --------------------------
  return "chunk-index";
};
