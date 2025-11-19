<template>
  <div class="flex flex-row gap-20px">
    <!-- 颜色选择器组件 -->
    <Transition name="slide-left">
      <div
        ref="colorPickerRef"
        v-if="visible"
        class="flex flex-col items-start gap-24px p-24px border border-solid border-#fff rounded-8px bg-#fff fixed top-50px left-12px z-9999 shadow-lg max-w-80%"
      >
        <!-- 只剩最大色环 -->
        <div
          class="relative w-300px h-300px rounded-full cursor-crosshair overflow-hidden select-none"
          @click="onPick"
          @mousemove="onMove"
          @mouseleave="onMouseLeave"
        >
          <!-- 最大色环 -->
          <div class="ring" />

          <!-- 交互指针 -->
          <div
            v-if="showTip"
            class="tip absolute w-24px h-24px"
            :style="{ left: tipX + 'px', top: tipY + 'px' }"
          >
            <div
              class="tip-ring w-24px h-24px rounded-full"
              :style="{ background: displayColor }"
            />
            <div>点击即可修改主题色</div>
          </div>
        </div>

        <!-- 亮度滑杆 - Element Plus 滑块组件 -->
        <div class="slider mt-16px w-360px flex items-center gap-8px">
          <el-slider
            v-model="lightness"
            :min="0"
            :max="90"
            :step="1"
            :show-tooltip="true"
            :format-tooltip="(val) => `${val}%`"
            @input="onLightnessChange"
            @change="onLightnessChange"
          />
        </div>
        <div class="text-black">亮度：{{ lightness }}%</div>

        <!-- 当前主题色 -->
        <div class="controls flex flex-row items-center gap-12px">
          <div class="info flex items-center gap-8px">
            <div
              class="swatch w-50px h-50px rounded-4px border border-gray-300"
              :style="{ background: displayColor }"
              @click="selectCurrentColor"
              title="点击选中当前颜色"
            />
            <span class="color-label text-#000">当前选中主题色</span>
          </div>
          <button
            class="apply-btn px-12px py-6px text-white rounded-4px cursor-pointer text-14px hover:transform hover:translate-y--1px active:transform active:translate-y-0 hover:bg-#66b1ff"
            @click="applyColor"
          >
            应用
          </button>
        </div>
      </div>
    </Transition>
    <!-- 主题色展示按钮 -->
    <div
      ref="themeTab"
      class="theme-tab flex flex-col items-center"
      :class="{ mirror: isMirror }"
      @click="toggleColorPicker"
    >
      <div :class="{ mirror: isMirror }">主题色展示</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";

// 颜色选择器是否可见
const visible = ref(false);
const colorPickerRef = ref(null);
const themeTab = ref(null);
// 是否镜像显示
const isMirror = ref(false);

// 切换颜色选择器显示状态
const toggleColorPicker = () => {
  visible.value = !visible.value;
  console.log("颜色选择器显示状态变化:", visible.value);
  if (!visible.value) {
    isMirror.value = false;
    // 将这个位置设置为按钮的偏移位置
    themeTab.value.style.left = `0px`;
    return;
  } else {
    nextTick(() => {
      console.log(
        "颜色选择器位置:",
        colorPickerRef.value.getBoundingClientRect()
      );
      const { width = 0 } = colorPickerRef.value.getBoundingClientRect();

      const positionX = Math.round(12 + width) || 0;
      console.log(
        "themeTab位置:",
        positionX,
        "themeTab宽度:",
        themeTab.value.offsetWidth
      );
      // 当前屏幕可视宽度
      const viewWidth = window.innerWidth;
      //按钮超出屏幕可视宽度时，调整位置
      if (viewWidth < positionX + themeTab.value.offsetWidth) {
        isMirror.value = true;
        console.log(positionX, themeTab.value.offsetWidth);
        themeTab.value.style.left = `${
          positionX - themeTab.value.offsetWidth
        }px`;
        return;
      }
      // 将这个位置设置为按钮的偏移位置
      themeTab.value.style.left = `${positionX}px`;
    });
  }
};

// Emits定义
const emit = defineEmits(["change"]);

// 色环中心坐标（180,180），半径180px
const center = ref(180);
const radius = ref(180);
// 内环半径90px（遮罩透明区域）
const innerR = ref(90);
// 色相：0-360度
const hue = ref(0);
// 饱和度：0-100%
const saturation = ref(100);
// 亮度：0-100%
const lightness = ref(50);
// 鼠标位置
const tipX = ref(0);
const tipY = ref(0);
// 是否显示指针
const showTip = ref(false);
// 当前颜色预览
const preview = ref("");
// 临时颜色（鼠标移动时预览）
const tempHue = ref(0);
const tempSaturation = ref(100);
// 是否正在预览临时颜色
const isPreviewing = ref(false);

// 当前HSL颜色字符串
const currentHsl = computed(() => {
  return `hsl(${hue.value} ${saturation.value}% ${lightness.value}%)`;
});

// 临时预览颜色字符串
const tempHsl = computed(() => {
  return `hsl(${tempHue.value} ${tempSaturation.value}% ${lightness.value}%)`;
});

// 显示颜色（预览时使用临时颜色，否则使用当前颜色）
const displayColor = computed(() => {
  return isPreviewing.value ? tempHsl.value : currentHsl.value;
});

// 点击色环选择颜色
const onPick = (e) => {
  // 退出预览模式
  isPreviewing.value = false;
  // 更新实际颜色值
  updateColor(e);
  console.log("当前颜色:", currentHsl.value);
  // 不再立即提交事件，等待用户点击应用按钮
};

// 鼠标移动更新指针
const onMove = (e) => {
  showTip.value = true;
  updateColor(e);
  // 进入预览模式
  isPreviewing.value = true;
};

// 根据鼠标位置计算颜色
const updateColor = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  // 计算鼠标相对于色环中心的坐标
  const x = e.clientX - rect.left - center.value;
  const y = e.clientY - rect.top - center.value;

  // 计算距离中心的距离（半径） a² + b² = c²
  const distance = Math.sqrt(x * x + y * y);

  // 检查是否在有效环形区域内（90px-180px）
  if (distance < innerR.value || distance > radius.value) {
    return; // 超出范围，不处理
  }

  // 计算角度（弧度转角度）
  // Math.atan2返回的是数学坐标系角度（x轴正方向为0°，逆时针）
  // 需要转换为色环坐标系（顶部为0°，顺时针）
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  // 调整：将数学角度转换为色环角度（顶部为0°，顺时针增加）
  // 步骤1：将-180~180转换为0~360
  angle = (angle + 360) % 360;
  // 步骤2：将x轴0°调整为顶部0°（加90°）
  angle = (angle + 90) % 360;
  console.log("当前角度:", angle);

  // 计算饱和度（距离内环越远饱和度越高）
  const normalizedDistance =
    (distance - innerR.value) / (radius.value - innerR.value);
  const saturationValue = Math.round(normalizedDistance * 100);

  // 如果是预览模式，更新临时颜色值
  if (isPreviewing.value) {
    tempHue.value = Math.round(angle);
    tempSaturation.value = Math.max(0, Math.min(100, saturationValue));
  } else {
    // 否则更新实际颜色值
    hue.value = Math.round(angle);
    saturation.value = Math.max(0, Math.min(100, saturationValue));
  }

  // 更新指针位置
  tipX.value = e.clientX - rect.left;
  tipY.value = e.clientY - rect.top;

  // 更新预览颜色
  updatePreview();
};

// 更新预览颜色
const updatePreview = () => {
  preview.value = isPreviewing.value ? tempHsl.value : currentHsl.value;
};

// 鼠标离开色环
const onMouseLeave = () => {
  showTip.value = false;
  // 退出预览模式，回到实际颜色
  isPreviewing.value = false;
};

// 亮度滑杆值变化处理
const onLightnessChange = () => {
  updatePreview();
  // 亮度变化时不再立即提交事件，等待用户点击应用按钮
};

// 应用当前颜色
const applyColor = async () => {
  emit("change", currentHsl.value);
  console.log("应用颜色:", currentHsl.value);

  // 添加应用成功的视觉反馈
  await nextTick();
  const btn = document.querySelector(".apply-btn");
  if (btn) {
    btn.style.background = "#67c23a";
    btn.textContent = "已应用";
    setTimeout(() => {
      btn.style.background = "#409eff";
      btn.textContent = "应用";
    }, 1000);
  }
};
</script>

<style scoped>
.mirror {
  transform: scaleX(-1); /* 绕 Y 轴镜像 */
}

.theme-tab {
  position: fixed;
  top: 50px;
  left: 0px;
  writing-mode: vertical-rl; /* 文字从上到下 */
  white-space: nowrap; /* 不换行 */
  background: var(--el-color-primary);
  color: #fff;
  padding: 12px;
  border-radius: 0 14px 14px 0;
  cursor: pointer;
  z-index: 99999;
  transition: all 0.3s ease; /* 添加平滑过渡动画 */
}

.picker {
  display: flex;
  gap: 24px;
  align-items: center;
  font-family: sans-serif;
  color: #fff;
}

/* 色环容器 */
.color-circle {
  /* 色环特有的遮罩效果 */
  mask: radial-gradient(circle at center, transparent 90px, black 91px);
  /* -webkit-mask: radial-gradient(circle at center, transparent 90px, black 91px); */
}

/* 唯一色环 */
.ring {
  /* 绝对定位，相对于父容器 .color-circle */
  position: absolute;
  /* 同时设置 top/right/bottom/left 为 0，填满整个父容器 */
  inset: 0;
  /* 设置圆形边框，创建圆形效果 */
  border-radius: 50%;
  /* 锥形渐变背景：从0度开始，按色相环顺序展示主要颜色 */
  background: conic-gradient(
    from 0deg,
    /* 渐变起始角度：从0度开始 */ hsl(0 100% 50%),
    /* 红色 (0°) - 色相0度，全饱和，中等亮度 */ hsl(60 100% 50%),
    /* 黄色 (60°) - 色相60度，全饱和，中等亮度 */ hsl(120 100% 50%),
    /* 绿色 (120°) - 色相120度，全饱和，中等亮度 */ hsl(180 100% 50%),
    /* 青色 (180°) - 色相180度，全饱和，中等亮度 */ hsl(240 100% 50%),
    /* 蓝色 (240°) - 色相240度，全饱和，中等亮度 */ hsl(300 100% 50%),
    /* 洋红 (300°) - 色相300度，全饱和，中等亮度 */ hsl(360 100% 50%)
      /* 回到红色 (360°) - 色相360度，全饱和，中等亮度 */
  );
  /* CSS遮罩：创建环形效果 - 内径90px透明，外径91px显示 */
  mask: radial-gradient(circle at center, transparent 90px, black 91px);
  /* WebKit浏览器前缀兼容 - 同上，确保Safari等浏览器兼容 */
  /* -webkit-mask: radial-gradient(circle at center, transparent 90px, black 91px); */
}

/* 交互指针容器 */
.tip {
  /* 确保指针在最上层显示 */
  z-index: 100;
  /* 禁用鼠标事件，避免干扰色环点击 */
  pointer-events: none;
  /* 以中心点为基准进行定位偏移 */
  transform: translate(-50%, -50%);
}
/* 指针圆环 */
.tip-ring {
  /* 白色外边框：3px宽度 */
  border: 3px solid #fff;
  /* 黑色外发光和内发光：增强可视性 */
  box-shadow: 0 0 0 2px #000, inset 0 0 0 2px #000;
  /* 以中心点为基准进行定位偏移 */
  transform: translate(-50%, -50%);
}

/* 亮度滑杆容器 */
.slider {
  /* Element Plus滑块需要的特定样式 */
  margin-top: 12px;
  width: 200px;
}

/* Element Plus 滑块自定义样式 */
.slider :deep(.el-slider) {
  /* 滑块占满剩余空间 */
  flex: 1;
  /* 自定义滑块颜色，与整体色调匹配 */
  --el-slider-main-bg-color: #409eff;
  --el-slider-runway-bg-color: #e4e7ed;
  --el-slider-stop-bg-color: #fff;
  --el-slider-disabled-color: #c0c4cc;
  --el-slider-border-radius: 3px;
  --el-slider-height: 6px;
  --el-slider-button-size: 16px;
  --el-slider-button-wrapper-size: 36px;
  --el-slider-button-wrapper-offset: -15px;
}

/* 滑块标签样式 */
.slider label {
  /* 最小宽度，确保百分比显示完整 */
  min-width: 60px;
  /* 字体大小 */
  font-size: 14px;
  /* 字体颜色 */
  color: #fff;
  /* 字体粗细 */
  font-weight: 500;
}

/* 亮度滑杆容器样式 */
.slider {
  /* Element Plus滑块需要的特定样式 */
}
/* 应用按钮 */
.apply-btn {
  /* 按钮需要的特定样式 */
  background: #409eff;
  border: none;
  transition: background-color 0.3s ease;
}
/* 颜色预览方块 */
.swatch {
  /* 深灰色边框：1像素 */
  border: 1px solid #444;
  /* 背景颜色：当前选择的颜色 */
  background-color: var(--theme-color);
}

/* 从左到右滑动过渡效果 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
