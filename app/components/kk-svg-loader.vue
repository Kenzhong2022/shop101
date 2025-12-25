<template>
  <!-- 
    SVG根元素
    xmlns: 命名空间，必须设置为"http://www.w3.org/2000/svg" <mcreference link="http://www.w3.org/2000/svg" index="0">0</mcreference>
    width/height: 控制SVG的显示尺寸，支持响应式设计
    viewBox: 定义内部坐标系统，格式为"minX minY width height"
           调整这个值可以改变SVG的内部比例和可视区域
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 400 300"
    :class="customClass"
  >
    <!-- 
      背景矩形
      width="100%" height="100%": 填满整个SVG容器
      fill="#ccc": 背景颜色，可改为其他颜色如"#f0f0f0", "rgba(0,0,0,0.1)"
      删除此元素可创建透明背景
    -->
    <rect width="100%" height="100%" fill="none" />

    <!-- 
      组元素：用于组合多个图形元素
      transform="translate(200, 150)": 将坐标原点移动到SVG中心(200,150)
                                     调整这个值可以改变整个动画的位置
    -->
    <g transform="translate(200, 150)">
      <!-- 
        外层静态圆环（背景圆环）
        cx="0" cy="0": 圆心坐标，相对于组的变换原点
        r="40": 半径，增大这个值可以让圆环变大
        fill="none": 不填充内部，只显示边框
        stroke="#666": 边框颜色，可改为"#999", "#blue"等
        stroke-width="4": 边框宽度，增大值让线条更粗
        stroke-dasharray="251.2": 创建虚线效果，值=2πr（约6.28×40）
                                设置为"0"可创建实线
        stroke-dashoffset="0": 虚线偏移，用于动画效果
      -->
      <circle
        cx="0"
        cy="0"
        r="40"
        fill="none"
        stroke="#666"
        stroke-width="4"
        stroke-dasharray="251.2"
        stroke-dashoffset="0"
      />

      <!-- 
        内层旋转圆环（动画圆环）
        属性说明同上，但有以下关键差异：
        stroke="#333": 更深的颜色，与背景圆环形成对比
        stroke-dashoffset="62.8": 虚线偏移=周长/4，创建缺口效果
        stroke-linecap="round": 线条端点样式为圆形，更美观
      -->
      <circle
        cx="0"
        cy="0"
        r="40"
        fill="none"
        stroke="#333"
        stroke-width="4"
        stroke-dasharray="251.2"
        stroke-dashoffset="62.8"
        stroke-linecap="round"
      >
        <!-- 
          动画变换：创建旋转效果的核心
          attributeName="transform": 要动画的属性
          type="rotate": 旋转变换
          from="0 0 0": 起始状态（角度 x y）
          to="360 0 0": 结束状态（360度旋转）
          dur="1.5s": 动画持续时间，减小值可加快旋转
          repeatCount="indefinite": 无限重复
          easing="linear": 线性缓动，保持匀速旋转
        -->
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="1.5s"
          repeatCount="indefinite"
          easing="linear"
        />
      </circle>

      <!-- 
        加载文字
        x="0" y="120": 文字位置，x=0表示水平居中
                        调整y值可改变文字的垂直位置
        font-family="Arial, sans-serif": 字体族
        font-size="16": 字体大小，增大值让文字更大
        fill="#333": 文字颜色
        text-anchor="middle": 文字对齐方式，middle表示居中对齐
      -->
      <text
        x="0"
        y="120"
        font-family="Arial, sans-serif"
        font-size="16"
        fill="#333"
        text-anchor="middle"
      >
        {{ loadingText }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
/**
 * Props接口定义
 * 所有属性都是可选的，有默认值
 */
interface Props {
  /**
   * SVG显示宽度
   * 支持数字(像素)或字符串("100%", "10rem"等)
   * 默认值: 400 (像素)
   */
  width?: number | string;

  /**
   * SVG显示高度
   * 支持数字(像素)或字符串("100%", "10rem"等)
   * 默认值: 300 (像素)
   */
  height?: number | string;

  /**
   * 加载提示文字
   * 可自定义为"上传中...", "处理中..."等
   * 默认值: "图片加载中..."
   */
  loadingText?: string;

  /**
   * 自定义CSS类名
   * 用于添加额外的样式，如阴影、边框等
   * 默认值: 空字符串
   */
  customClass?: string;
}

/**
 * Props默认值设置
 * withDefaults允许为Props设置默认值
 * 这样在父组件中不需要传递所有属性
 */
const props = withDefaults(defineProps<Props>(), {
  width: 400, // 默认宽度400像素
  height: 300, // 默认高度300像素
  loadingText: "图片加载中...", // 默认加载文字
  customClass: "", // 默认无自定义类名
});
</script>

<style scoped>
/**
 * 组件样式
 * scoped属性确保样式只应用于当前组件
 * 避免样式污染全局
 */

/* SVG基础样式 */
svg {
  display: block; /* 让SVG成为块级元素，便于居中 */
  margin: 0 auto; /* 水平居中 */

  /**
   * 可选的额外样式：
   * transition: all 0.3s ease;  // 添加过渡动画
   * filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));  // 添加阴影
   * border-radius: 8px;  // 圆角（需要配合overflow: hidden）
   */
}

/**
 * 自定义样式类示例
 * 可以通过customClass属性添加这些类
 */

/* 阴影效果 */
.shadow-effect {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

/* 圆角边框 */
.rounded-border {
  border: 2px solid #007acc;
  border-radius: 12px;
}

/* 渐变背景 */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
