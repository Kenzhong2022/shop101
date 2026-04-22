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
 * @param {string} [sourcePage=""] - 来源页面URL，用于记录用户行为来源
 * @returns {Object} - 包含 track 方法和 getSessionId 方法的对象
 */

// localStorage key
const SESSION_ID_KEY = "analytics_session_id";

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

// 初始化 sessionId（从 localStorage 读取）
let sessionId = getSessionIdFromStorage();
/**
 *
 * @param {string|number} itemId - 商品ID，必须是 string 或 number 类型
 * @param {Object} options 配置项，可选参数
 * @param {string} [options.behaviorType="click"] - 行为类型：click|fav|cart|buy
 * @param {boolean} [options.autoTrack=true] - 是否自动上报
 * @param {Function} [options.getDuration] - 外部传入的获取浏览时长函数（毫秒）
 * @param {string} [sourcePage=""] - 来源页面URL，用于记录用户行为来源
 * @returns
 */
export function useProductBehavior(itemId, options = {}, sourcePage = "") {
  // 参数校验
  if (!itemId || (typeof itemId !== "string" && typeof itemId !== "number")) {
    console.error("useProductBehavior: itemId 必须是 string 或 number");
    return { track: () => {}, getSessionId: () => sessionId };
  }

  // 解构赋值，设置默认值
  const {
    behaviorType = "click",
    autoTrack = true,
    getDuration = () => 0,
  } = options;

  // 验证行为类型
  if (!ACTION_TYPE_MAP[behaviorType]) {
    console.error(`useProductBehavior: 不支持的行为类型 "${behaviorType}"`);
    return { track: () => {}, getSessionId: () => sessionId };
  }

  console.log("useProductBehavior:", itemId, behaviorType);

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

    return {
      item_id: Number(itemId),
      action_type: actionType,
      action_weight: actionWeight,
      action_time: new Date().toISOString(),
      ...extra,
      source_page: sourcePage,
      session_id: getSessionIdFromStorage(), // 从 localStorage 读取最新的 session_id
    };
  }

  /**
   * 上报方法（供外部调用）
   * @param {Object} customData - 额外数据，如用户ID、订单ID等
   * @returns {Promise<Object>} - 包含服务器响应的 Promise
   */
  async function track(customData = {}) {
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

      return result.data;
    } catch (error) {
      console.error("行为上报失败:", error);
      navigator.sendBeacon(
        "/api/analytics/product/behavior",
        new Blob([JSON.stringify(data)], { type: "application/json" }),
      );
    }
  }

  // ============ 自动上报 ============

  if (autoTrack) {
    // 自动上报行为
    setTimeout(() => track(), 0);
  }

  return {
    track, // 上报方法
    getSessionId: () => getSessionIdFromStorage(), // 从 localStorage 获取 session_id
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
