// composables/useProductBehavior.js

// 行为类型映射：字符串 -> 数字
const ACTION_TYPE_MAP = {
  click: 1, // 点击
  fav: 2, // 收藏
  cart: 3, // 加购
  buy: 4, // 购买
};

// 行为权重映射：行为类型 -> 权重值
const ACTION_WEIGHT_MAP = {
  click: 1, // 点击权重 1
  fav: 3, // 收藏权重 3
  cart: 5, // 加购权重 5
  buy: 10, // 购买权重 10
};

/**
 * 用户商品行为追踪（点击、收藏、加购、购买等）
 * @param {string|number} itemId - 商品ID，必须是 string 或 number 类型
 * @param {Object} options - 配置项，可选参数
 * @param {string} [options.behaviorType="click"] - 行为类型：click|fav|cart|buy
 * @param {boolean} [options.autoTrack=true] - 是否自动上报
 * @param {Function} [options.getDuration] - 外部传入的获取浏览时长函数（毫秒）
 * @param {boolean} [options.requireLogin=false] - 是否要求用户登录才能上报
 * @param {string} [sourcePage=""] - 来源页面URL，用于记录用户行为来源
 * @returns {Object} - 包含 track 方法和 getSessionId 方法的对象
 */

// localStorage key
const SESSION_ID_KEY = "analytics_session_id";
const USER_ID_KEY = "analytics_user_id";

// ============ localStorage 读写函数 ============

/**
 * 从 localStorage 读取 session_id
 * @returns {string|null}
 */
function getSessionIdFromStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(SESSION_ID_KEY);
  }
  return null;
}

/**
 * 保存 session_id 到 localStorage
 * @param {string} id - session_id
 */
function saveSessionIdToStorage(id) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(SESSION_ID_KEY, id);
    console.log("【Session ID 已保存到 localStorage】", id);
  }
}

/**
 * 从 localStorage 读取 user_id
 * @returns {string|null}
 */
function getUserIdFromStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(USER_ID_KEY);
  }
  return null;
}

/**
 * 保存 user_id 到 localStorage
 * @param {string|number} userId - 用户ID
 */
function saveUserIdToStorage(userId) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(USER_ID_KEY, String(userId));
    console.log("【User ID 已保存到 localStorage】", userId);
  }
}

// 初始化 sessionId（从 localStorage 读取）
let sessionId = getSessionIdFromStorage();

/**
 * 检查用户是否已登录
 * @returns {boolean} - 用户是否已登录
 */
function isUserLoggedIn() {
  if (typeof window === "undefined") return false;

  // 方式1：检查 cookie 中的 auth-token
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth-token" && value) {
      return true;
    }
  }
  return false;
}

/**
 * 从 JWT token 中解析用户ID
 * @returns {number|null} - 用户ID，如果未登录返回 null
 */
function getUserIdFromToken() {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    let token = null;
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth-token") {
        token = value;
        break;
      }
    }

    if (!token) return null;

    // 解析 JWT Payload（第二部分）
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    // 解码 base64
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.userId || null;
  } catch (error) {
    console.error("【解析用户ID失败】", error);
    return null;
  }
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null} - 用户信息对象 { userId, isLoggedIn }
 */
function getCurrentUser() {
  const userId = getUserIdFromToken();
  return {
    userId,
    isLoggedIn: !!userId,
  };
}

/**
 *
 * @param {string|number} itemId - 商品ID，必须是 string 或 number 类型
 * @param {Object} options 配置项，可选参数
 * @param {string} [options.behaviorType="click"] - 行为类型：click|fav|cart|buy
 * @param {boolean} [options.autoTrack=true] - 是否自动上报
 * @param {Function} [options.getDuration] - 外部传入的获取浏览时长函数（毫秒）
 * @param {boolean} [options.requireLogin=false] - 是否要求用户登录才能上报
 * @param {string} [sourcePage=""] - 来源页面URL，用于记录用户行为来源
 * @returns
 */
export function useProductBehavior(itemId, options = {}, sourcePage = "") {
  // 参数校验
  if (!itemId || (typeof itemId !== "string" && typeof itemId !== "number")) {
    console.error("useProductBehavior: itemId 必须是 string 或 number");
    return {
      track: () => {},
      getSessionId: () => sessionId,
      isLoggedIn: () => false,
    };
  }

  // 解构赋值，设置默认值
  const {
    behaviorType = "click",
    autoTrack = true,
    getDuration = () => 0,
    requireLogin = false, // 新增：是否要求登录
  } = options;

  // 验证行为类型
  if (!ACTION_TYPE_MAP[behaviorType]) {
    console.error(`useProductBehavior: 不支持的行为类型 "${behaviorType}"`);
    return {
      track: () => {},
      getSessionId: () => sessionId,
      isLoggedIn: () => false,
    };
  }

  // 获取当前用户信息
  const currentUser = getCurrentUser();

  console.log(
    "useProductBehavior:",
    itemId,
    behaviorType,
    "用户状态:",
    currentUser,
  );

  // 如果要求登录但用户未登录，返回空函数
  if (requireLogin && !currentUser.isLoggedIn) {
    console.warn(
      `【行为追踪】行为类型 "${behaviorType}" 要求登录，但用户未登录，跳过上报`,
    );
    return {
      track: () => {
        console.warn("【行为上报跳过】用户未登录");
        return Promise.resolve({ skipped: true, reason: "用户未登录" });
      },
      getSessionId: () => sessionId,
      isLoggedIn: () => false,
      userId: null,
    };
  }

  // ============ 核心方法 ============

  /**
   * 构建上报数据
   * @param {Object} extra - 额外数据，如用户ID、订单ID等
   * @returns {Object}
   * 包含商品ID、行为类型、权重、时间戳、额外数据的对象
   */
  function buildData(extra = {}) {
    const actionType = ACTION_TYPE_MAP[behaviorType]; // 行为类型映射
    const actionWeight = ACTION_WEIGHT_MAP[behaviorType]; // 行为权重映射

    // 获取浏览时长
    let duration = 0;
    try {
      duration = getDuration();
    } catch (error) {
      console.warn("【获取浏览时长失败】", error);
      duration = 0;
    }

    // 构建基础数据
    const baseData = {
      item_id: Number(itemId),
      action_type: actionType,
      action_weight: actionWeight,
      action_time: new Date().toISOString(),
      duration: duration, // 浏览时长（毫秒）
      source_page: sourcePage,
      session_id: getSessionIdFromStorage(), // 从 localStorage 读取最新的 session_id
    };

    // 如果用户已登录，添加用户ID
    if (currentUser.userId) {
      baseData.user_id = currentUser.userId;
    }

    return {
      ...baseData,
      ...extra,
    };
  }

  /**
   * 上报方法（供外部调用）
   * @param {Object} customData - 额外数据，如用户ID、订单ID等
   * @returns {Promise<Object>} - 包含服务器响应的 Promise
   */
  async function track(customData = {}) {
    // 如果要求登录但用户未登录，跳过上报
    if (requireLogin && !currentUser.isLoggedIn) {
      console.warn("【行为上报跳过】要求登录但用户未登录");
      return { skipped: true, reason: "用户未登录" };
    }

    const data = buildData(customData);
    console.log("【行为上报开始】", behaviorType, data);

    try {
      const { $axios } = useNuxtApp();
      const result = await $axios.post("/analytics/product/behavior", data);
      console.log("【行为上报响应】", result.data);

      if (result.data.session_id) {
        sessionId = result.data.session_id;
        saveSessionIdToStorage(sessionId);
      }

      // 如果服务器返回了用户ID，保存到本地
      if (result.data.user_id) {
        saveUserIdToStorage(result.data.user_id);
      }

      return result.data;
    } catch (error) {
      console.error("行为上报失败:", error);

      // 使用 sendBeacon 兜底上报
      try {
        navigator.sendBeacon(
          "/api/analytics/product/behavior",
          new Blob([JSON.stringify(data)], { type: "application/json" }),
        );
        console.log("【行为上报兜底】已通过 sendBeacon 发送");
      } catch (beaconError) {
        console.error("【行为上报兜底失败】", beaconError);
      }
    }
  }

  // ============ 自动上报 ============

  if (autoTrack) {
    // 自动上报行为（使用微任务延迟，确保DOM更新完成）
    queueMicrotask(() => {
      if (!requireLogin || currentUser.isLoggedIn) {
        track().catch(console.error);
      }
    });
  }

  return {
    track, // 上报方法
    getSessionId: () => getSessionIdFromStorage(), // 从 localStorage 获取 session_id
    getUserId: () => currentUser.userId, // 获取当前用户ID
    isLoggedIn: () => currentUser.isLoggedIn, // 检查用户是否登录
    ACTION_TYPE_MAP, // 行为类型映射
    ACTION_WEIGHT_MAP, // 行为权重映射
  };
}

// ============ 工具函数 ============

export function getActionTypeName(actionType) {
  const names = {
    1: "点击",
    2: "收藏",
    3: "加购",
    4: "购买",
  };
  return names[actionType] || "未知";
}

export function getActionWeight(behaviorType) {
  return ACTION_WEIGHT_MAP[behaviorType] || 0;
}

/**
 * 检查用户登录状态的独立函数
 * @returns {boolean} - 用户是否已登录
 */
export function checkUserLogin() {
  return isUserLoggedIn();
}

/**
 * 获取当前用户ID的独立函数
 * @returns {number|null} - 用户ID
 */
export function getCurrentUserId() {
  return getUserIdFromToken();
}
