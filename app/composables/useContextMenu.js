// 右键菜单
/**
 * 右键菜单
 * @param {Ref} contextMenuRef 右键菜单的引用
 * @returns {Object} 包含菜单是否可见、菜单的 x 坐标、菜单的 y 坐标的对象
 */
export function useContextMenu(contextMenuRef) {
  // 菜单是否可见 菜单的 x坐标 y坐标
  const isShow = ref(false);
  const x = ref(0);
  const y = ref(0);

  //事件返回处理
  const showMenu = (e) => {
    console.log("showMenu");
    // 阻止默认右键菜单
    e.preventDefault();
    // 阻止事件冒泡
    e.stopPropagation();

    isShow.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  };

  // 点击其他地方隐藏菜单
  const hideMenu = () => {
    isShow.value = false;
  };

  // 右键事件注册
  onMounted(() => {
    console.log("这是右键菜单>>>>>>>>>>>>>>>>>>>>>", contextMenuRef.value);
    if (contextMenuRef.value) {
      contextMenuRef.value.addEventListener("contextmenu", showMenu);
    }
    // 点击其他地方隐藏菜单
    window.addEventListener("click", hideMenu);
    // 浏览器默认右键事件
    window.addEventListener("contextmenu", hideMenu);
    // 浏览器滑动事件
    window.addEventListener("scroll", hideMenu);
  });

  //卸载事件
  onUnmounted(() => {
    if (contextMenuRef.value) {
      contextMenuRef.value.removeEventListener("contextmenu", showMenu);
    }
    window.removeEventListener("click", hideMenu);
    window.removeEventListener("contextmenu", hideMenu);
    window.removeEventListener("scroll", hideMenu);
  });

  return {
    isShow,
    x,
    y,
  };
}
