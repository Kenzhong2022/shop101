<template>
  <div class="picker">
    <!-- 只剩最大色环 -->
    <div
      class="color-circle"
      @click="onPick"
      @mousemove="onMove"
      @mouseleave="showTip = false"
    >
      <div class="ring" />

      <!-- 交互指针 -->
      <div
        v-if="showTip"
        class="tip"
        :style="{ left: tipX + 'px', top: tipY + 'px' }"
      >
        <div class="tip-ring" :style="{ background: preview }" />
      </div>
    </div>

    <!-- 亮度滑杆 -->
    <div class="slider">
      <label>亮度：{{ lightness }}%</label>
      <input
        v-model.number="lightness"
        type="range"
        min="0"
        max="100"
        step="1"
        @input="onLightnessChange"
        @change="onLightnessChange"
        @wheel="onLightnessWheel"
        @keydown.up.prevent="adjustLightness(1)"
        @keydown.down.prevent="adjustLightness(-1)"
        @keydown.left.prevent="adjustLightness(-1)"
        @keydown.right.prevent="adjustLightness(1)"
      />
    </div>

    <!-- 实时色值 -->
    <div class="info">
      <div class="swatch" :style="{ background: currentHsl }" />
      <span>{{ currentHsl }}</span>
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
    };
  },
  computed: {
    // 当前HSL颜色字符串
    currentHsl() {
      return `hsl(${this.hue} ${this.saturation}% ${this.lightness}%)`;
    },
  },
  methods: {
    // 点击色环选择颜色
    onPick(e) {
      this.updateColor(e);
      this.$emit("change", this.currentHsl);
    },
    // 鼠标移动更新指针
    onMove(e) {
      this.showTip = true;
      this.updateColor(e);
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
      console.log("angle:", angle);

      // 计算饱和度（距离内环越远饱和度越高）
      const normalizedDistance =
        (distance - this.innerR) / (this.radius - this.innerR);
      const saturation = Math.round(normalizedDistance * 100);

      // 更新颜色值
      this.hue = Math.round(angle);
      // 确保饱和度在0-100%范围内
      this.saturation = Math.max(0, Math.min(100, saturation));

      // 更新指针位置
      this.tipX = e.clientX - rect.left;
      this.tipY = e.clientY - rect.top;

      // 更新预览颜色
      this.updatePreview();
    },
    // 更新预览颜色
    updatePreview() {
      this.preview = this.currentHsl;
    },
    // 亮度滑杆值变化处理
    onLightnessChange() {
      this.updatePreview();
      this.$emit("change", this.currentHsl);
    },
    // 鼠标滚轮调整亮度
    onLightnessWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1; // 向下滚减少，向上滚增加
      const newValue = Math.max(0, Math.min(100, this.lightness + delta * 5));
      this.lightness = newValue;
      this.onLightnessChange();
    },
    // 键盘调整亮度（支持方向键）
    adjustLightness(delta) {
      const newValue = Math.max(0, Math.min(100, this.lightness + delta * 1));
      this.lightness = newValue;
      this.onLightnessChange();
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
  /* 相对定位，作为子元素的定位参考 */
  position: relative;
  /* 容器尺寸：360x360像素，匹配色环大小 */
  width: 360px;
  height: 360px;
  /* 圆形边框，确保容器本身是圆形 */
  border-radius: 50%;
  /* 鼠标样式：十字光标，表示可点击选择 */
  cursor: crosshair;
  /* 隐藏超出容器范围的内容，确保遮罩效果正确 */
  overflow: hidden;
  /* 禁用文本选择，避免拖拽时选中文字 */
  user-select: none;
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
  -webkit-mask: radial-gradient(circle at center, transparent 90px, black 91px);
}

/* 交互指针容器 */
.tip {
  /* 绝对定位，跟随鼠标移动 */
  position: absolute;
  /* 指针尺寸：24x24像素 */
  width: 24px;
  height: 24px;
  /* 确保指针在最上层显示 */
  z-index: 100;
  /* 禁用鼠标事件，避免干扰色环点击 */
  pointer-events: none;
  /* 以中心点为基准进行定位偏移 */
  transform: translate(-50%, -50%);
}
/* 指针圆环 */
.tip-ring {
  /* 圆环尺寸：24x24像素 */
  width: 24px;
  height: 24px;
  /* 圆形外观 */
  border-radius: 50%;
  /* 白色外边框：3px宽度 */
  border: 3px solid #fff;
  /* 黑色外发光和内发光：增强可视性 */
  box-shadow: 0 0 0 2px #000, inset 0 0 0 2px #000;
  /* 以中心点为基准进行定位偏移 */
  transform: translate(-50%, -50%);
}

/* 亮度滑杆容器 */
.slider {
  /* 顶部间距：12像素 */
  margin-top: 12px;
  /* 弹性布局：水平排列 */
  display: flex;
  /* 垂直居中对齐 */
  align-items: center;
  /* 子元素间距：8像素 */
  gap: 8px;
}
.slider input {
  /* 输入框占满剩余空间 */
  flex: 1;
}

/* 颜色信息显示区域 */
.info {
  /* 弹性布局：水平排列 */
  display: flex;
  /* 垂直居中对齐 */
  align-items: center;
  /* 子元素间距：8像素 */
  gap: 8px;
}
/* 颜色预览方块 */
.swatch {
  /* 方块尺寸：32x32像素 */
  width: 32px;
  height: 32px;
  /* 小圆角：4像素 */
  border-radius: 4px;
  /* 深灰色边框：1像素 */
  border: 1px solid #444;
}
</style>
