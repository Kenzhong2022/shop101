// composables/useProductBehavior.js

/**
 * 商品行为追踪（浏览、点击、加购等）
 * @param {string|number} goodsId - 商品ID
 * @param {Object} options - 配置项
 * @param {string} [options.behaviorType="view"] - 行为类型：view|click|cart|fav
 * @param {boolean} [options.autoTrack=true] - 是否自动上报 view 行为
 * @param {string} [options.sourcePage=""] - 来源页面
 * @param {Function} [options.getDuration] - 外部传入的获取浏览时长函数（毫秒），用于 view 类型
 * @returns {Object} - 包含 track 方法的对象
 */
export function useProductBehavior(goodsId, options = {}) {
  // 参数校验
  if (
    !goodsId ||
    (typeof goodsId !== "string" && typeof goodsId !== "number")
  ) {
    console.error("useProductBehavior: goodsId 必须是 string 或 number");
    return { track: () => {} };
  }

  const {
    behaviorType = "view",
    autoTrack = true,
    sourcePage = "",
    getDuration, // 外部传入的计时函数
  } = options;

  console.log("useProductBehavior:", goodsId, behaviorType);

  // ============ 核心方法 ============

  /**
   * 构建上报数据
   */
  const buildData = (extra = {}) => ({
    goodsId,
    behaviorType,
    // view 类型且提供了 getDuration 函数时，调用获取时长
    duration:
      behaviorType === "view" && getDuration ? getDuration() : undefined,
    timestamp: new Date().toISOString(),
    sourcePage: sourcePage || document.referrer || location.pathname,
    deviceType: getDeviceType(),
    ...extra,
  });

  /**
   * 上报方法（供外部调用）
   */
  const track = (customData = {}) => {
    const data = buildData(customData);
    console.log("【行为上报】", behaviorType, data);

    // 非 view 行为用 fetch，view 行为建议在外部控制时机（如 deactivated）或用 sendBeacon
    if (behaviorType !== "view") {
      fetch("/api/analytics/product/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {
        // 失败时用 sendBeacon 兜底
        navigator.sendBeacon(
          "/api/analytics/product/behavior",
          new Blob([JSON.stringify(data)], { type: "application/json" }),
        );
      });
    } else {
      // view 行为默认用 sendBeacon（适合页面关闭/切换时）
      navigator.sendBeacon(
        "/api/analytics/product/behavior",
        new Blob([JSON.stringify(data)], { type: "application/json" }),
      );
    }
  };

  // ============ 自动上报非 view 行为 ============

  // 使用立即执行函数避免引入 ref 等 Vue 依赖
  if (autoTrack && behaviorType !== "view") {
    // 延迟到下一个 tick，确保初始化完成
    setTimeout(() => track(), 0);
  }

  return {
    track, // 手动上报方法
  };
}

// ============ 工具函数 ============

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}
