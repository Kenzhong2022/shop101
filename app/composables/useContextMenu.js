import { ref, onMounted, onUnmounted } from "vue";

/* ---------- 单例核心 ---------- */
let lastActiveMenu = null; // 存储上一次激活的菜单实例（isShow ref）
// console.log("【初始化】全局lastActiveMenu初始值：", lastActiveMenu);

/**
 * 关闭上一次激活的菜单
 * 核心依据：lastActiveMenu 存储了上一个激活的菜单isShow状态，直接修改其value为false即可关闭
 */
function turnOffLastActiveMenu() {
  // console.log("【关闭上一个】当前lastActiveMenu指向的实例：", lastActiveMenu);
  if (lastActiveMenu?.value) {
    // console.log("【关闭上一个】发现有激活的菜单，执行关闭：", lastActiveMenu);
    lastActiveMenu.value = false; // 直接修改上一个实例的isShow为false，实现关闭
  } else {
    // console.log("【关闭上一个】无上一个激活的菜单，无需操作");
  }
}
/* -------------------------------- */

/** 🔧 新增：一次性关闭所有已打开的菜单（兼容单例/多例） */
export function closeAll() {
  turnOffLastActiveMenu(); // 先关单例
  lastActiveMenu = null;
  return true;
}

/**
 * 右键菜单hooks（支持单例/多例模式）
 * @param {Ref} contextMenuRef 菜单DOM引用
 * @param {boolean} multi 是否多例（默认false：单例，同一时间仅显示一个）
 * @returns {Object} 菜单状态和方法
 */
export function useContextMenu(contextMenuRef, multi = false) {
  // 生成唯一标识，方便区分不同实例（核心：每个实例的isShow是独立的ref）
  const instanceId = Math.random().toString(36).slice(2, 8);
  const isShow = ref(false);
  const x = ref(0);
  const y = ref(0);

  // console.log(`【实例${instanceId}】初始化，multi模式：`, multi);
  // console.log(`【实例${instanceId}】初始isShow状态：`, isShow.value);

  const showMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // console.log(`【实例${instanceId}】触发右键，准备显示菜单`);
    if (!multi) {
      // console.log(`【实例${instanceId}】单例模式，先关闭上一个激活的菜单`);
      turnOffLastActiveMenu(); // 单例模式：显示当前菜单前，先关闭上一个激活的
    }

    isShow.value = true;
    // console.log(`【实例${instanceId}】自身isShow设为true：`, isShow.value);

    if (!multi) {
      // console.log(`【实例${instanceId}】单例模式，登记为上一个激活的菜单`);
      lastActiveMenu = isShow; // 把当前实例的isShow存入全局，作为"上一个激活标记"
    }

    x.value = e.clientX;
    y.value = e.clientY;
    // console.log(`【实例${instanceId}】菜单坐标：x=${x.value}, y=${y.value}`);
  };

  const hideMenu = () => {
    // console.log("隐藏");
    // console.log(`【实例${instanceId}】执行hideMenu，isShow设为false`);
    isShow.value = false;
  };

  onMounted(() => {
    const el = contextMenuRef.value;
    // console.log(`【实例${instanceId}】挂载，绑定右键事件到DOM：`, el);

    if (el) {
      el.addEventListener("contextmenu", showMenu);
    }
    // 绑定全局隐藏事件（点击/右键/滚动时关闭当前菜单）
    window.addEventListener("click", hideMenu);
    window.addEventListener("contextmenu", hideMenu);
    window.addEventListener("scroll", hideMenu);
  });

  onUnmounted(() => {
    const el = contextMenuRef.value;
    // console.log(`【实例${instanceId}】卸载，移除DOM右键事件`);

    if (el) el.removeEventListener("contextmenu", showMenu);
    // 移除全局隐藏事件
    window.removeEventListener("click", hideMenu);
    window.removeEventListener("contextmenu", hideMenu);
    window.removeEventListener("scroll", hideMenu);

    // 单例模式下：如果当前实例是"上一个激活的菜单"，释放全局标记
    if (!multi && lastActiveMenu === isShow) {
      // console.log(
      //   `【实例${instanceId}】是上一个激活的菜单，释放lastActiveMenu`
      // );
      lastActiveMenu = null;
    }
    // console.log(
    //   `【实例${instanceId}】卸载完成，当前lastActiveMenu：`,
    //   lastActiveMenu
    // );
  });

  return {
    isShow,
    x,
    y,
    hideMenu,
    turnOffLastActiveMenu,
    instanceId,
    closeAll,
  }; // 暴露instanceId方便调试
}
