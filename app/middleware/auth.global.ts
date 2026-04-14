/**
 * 全局路由守卫中间件
 *
 * 功能：
 * 1. 打印所有路由跳转信息到控制台
 * 2. 当跳转到会员中心页面时打印特殊提示
 * 3. 可以扩展用户认证、权限检查等功能
 */
// 类型定义
export interface RouteMeta {
  // 自定义元数据
  title?: string;
  layout?: string;
  icon?: string;
  pageInfo?: {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  };
  // 其他原始元数据
  [key: string]: any;
}

/**
 * @description 全局路由守卫中间件
 * @param to 目标路由元数据
 * @param from 源路由元数据
 * @returns {void}
 */
export default defineNuxtRouteMiddleware((to: RouteMeta, from: RouteMeta) => {
  // 打印基本的路由跳转信息
  // console.log("🔄 路由跳转:", {
  //   from: from.path || "首次访问",
  //   to: to.path || "未设置路径",
  //   fullPath: to.fullPath || "未设置完整路径",
  //   query: to.query || "未设置查询参数",
  //   params: to.params || "未设置路径参数",
  //   name: to.name || "未设置名称",
  //   meta: to.meta || "未设置元数据",
  // });

  // 检查是否跳转到会员中心页面
  const isAuthRequired = to.meta?.pageInfo?.requiresAuth;
  if (isAuthRequired) {
    // console.log("🔒 该页面需要认证");
    // console.log("📍 当前路径:", to.path);
    // console.log("🔍 路由信息:", {
    //   name: to.name,
    //   title: to.meta?.title || "未设置标题",
    //   layout: to.meta?.layout || "默认布局",
    // });
  }

  // 可以在这里添加更多的路由守卫逻辑
  // 例如：
  // 1. 用户认证检查
  // 2. 权限验证
  // 3. 页面访问日志记录
  // 4. 页面加载状态管理

  // 示例：检查用户是否已登录（需要配合状态管理）
  // const isLoggedIn = useAuth().isLoggedIn.value
  // if (isUserCenter && !isLoggedIn) {
  //   console.log('❌ 用户未登录，重定向到登录页')
  //   return navigateTo('/login')
  // }

  // 示例：记录页面访问时间
  const visitTime = new Date().toLocaleString("zh-CN");
  // console.log(`⏰ 访问时间: ${visitTime}`);

  // 示例：检查路由是否需要特殊处理
  if (to.meta?.pageInfo?.requiresAuth) {
    // 获取cookie中的token
    const token = useCookie("auth-token").value;
    // 保存to的路径，用于登录后跳转回原页面
    const redirectPath = to.fullPath;
    // console.log("🔄 保存跳转路径:", redirectPath);
    // 1.检查token是否存在
    if (!token) {
      // console.log("token为空，重定向到登录页");
      return navigateTo("/login/myLogin?redirect=" + redirectPath);
    }
    //  2.检查token是否过期
    const isExpired = tokenExpried();
    console.log("token是否过期：??", !isExpired);
    if (!isExpired) {
      // console.log("token过期，重定向到登录页");
      return navigateTo("/login/myLogin?redirect=" + redirectPath);
    }
  }

  if (to.meta?.pageInfo?.requiresAdmin) {
    console.log("👑 该页面需要管理员权限");
  }
});
