<template>
  <!-- 颜色选择器组件 -->
  <div
    v-if="0"
    class="flex flex-col items-start gap-24px p-24px border border-solid border-#fff rounded-8px max-w-360px bg-#fff fixed top-12px right-12px z-999 shadow-lg"
  >
    <!-- 只剩最大色环 -->
    <div
      class="relative w-360px h-360px rounded-full cursor-crosshair overflow-hidden select-none"
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
</template>

<script>
export default {
  data() {
    return {
      // 色环中心坐标（180,180），半径180px
      center: 180,
      radius: 180,
      // 内环半径90px（遮罩透明区域）
      innerR: 90,
      // 色相：0-360度
      hue: 0,
      // 饱和度：0-100%
      saturation: 100,
      // 亮度：0-100%
      lightness: 50,
      // 鼠标位置
      tipX: 0,
      tipY: 0,
      // 是否显示指针
      showTip: false,
      // 当前颜色预览
      preview: "",
      // 临时颜色（鼠标移动时预览）
      tempHue: 0,
      tempSaturation: 100,
      // 是否正在预览临时颜色
      isPreviewing: false,
    };
  },
  computed: {
    // 当前HSL颜色字符串
    currentHsl() {
      return `hsl(${this.hue} ${this.saturation}% ${this.lightness}%)`;
    },
    // 临时预览颜色字符串
    tempHsl() {
      return `hsl(${this.tempHue} ${this.tempSaturation}% ${this.lightness}%)`;
    },
    // 显示颜色（预览时使用临时颜色，否则使用当前颜色）
    displayColor() {
      return this.isPreviewing ? this.tempHsl : this.currentHsl;
    },
  },
  methods: {
    // 点击色环选择颜色
    onPick(e) {
      // 退出预览模式
      this.isPreviewing = false;
      // 更新实际颜色值
      this.updateColor(e);
      console.log("当前颜色:", this.currentHsl);
      // 不再立即提交事件，等待用户点击应用按钮
    },
    // 鼠标移动更新指针
    onMove(e) {
      this.showTip = true;
      this.updateColor(e);
      // 进入预览模式
      this.isPreviewing = true;
    },
    // 根据鼠标位置计算颜色
    updateColor(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      // 计算鼠标相对于色环中心的坐标
      const x = e.clientX - rect.left - this.center;
      const y = e.clientY - rect.top - this.center;

      // 计算距离中心的距离（半径） a² + b² = c²
      const distance = Math.sqrt(x * x + y * y);

      // 检查是否在有效环形区域内（90px-180px）
      if (distance < this.innerR || distance > this.radius) {
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
        (distance - this.innerR) / (this.radius - this.innerR);
      const saturation = Math.round(normalizedDistance * 100);

      // 如果是预览模式，更新临时颜色值
      if (this.isPreviewing) {
        this.tempHue = Math.round(angle);
        this.tempSaturation = Math.max(0, Math.min(100, saturation));
      } else {
        // 否则更新实际颜色值
        this.hue = Math.round(angle);
        this.saturation = Math.max(0, Math.min(100, saturation));
      }

      // 更新指针位置
      this.tipX = e.clientX - rect.left;
      this.tipY = e.clientY - rect.top;

      // 更新预览颜色
      this.updatePreview();
    },
    // 更新预览颜色
    updatePreview() {
      this.preview = this.isPreviewing ? this.tempHsl : this.currentHsl;
    },
    // 鼠标离开色环
    onMouseLeave() {
      this.showTip = false;
      // 退出预览模式，回到实际颜色
      this.isPreviewing = false;
    },
    // 亮度滑杆值变化处理
    onLightnessChange() {
      this.updatePreview();
      // 亮度变化时不再立即提交事件，等待用户点击应用按钮
    },
    // 应用当前颜色
    applyColor() {
      this.$emit("change", this.currentHsl);
      console.log("应用颜色:", this.currentHsl);
      // 添加应用成功的视觉反馈
      const btn = this.$el.querySelector(".apply-btn");
      if (btn) {
        btn.style.background = "#67c23a";
        btn.textContent = "已应用";
        setTimeout(() => {
          btn.style.background = "#409eff";
          btn.textContent = "应用";
        }, 1000);
      }
    },
  },
};
</script>

<style scoped>
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
</style>
