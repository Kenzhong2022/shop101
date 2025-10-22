<template>
  <div class="image-container">
    <el-image
      :src="src || defaultSrc"
      :preview-src-list="[src || defaultSrc]"
      @load="onImageLoad"
      @error="onImageError"
    >
    </el-image>

    <!-- 主色显示区域 -->
    <div v-if="mainColors.length > 0" class="color-palette">
      <div
        class="color-item"
        v-for="(color, index) in mainColors"
        :key="index"
        :style="{ backgroundColor: `rgb(${color.join(',')})` }"
        :title="`主色 ${index + 1}: rgb(${color.join(',')})`"
        @click="emitColor(color)"
      ></div>
    </div>

    <!-- 状态提示 -->
    <div v-if="statusText" class="status-text" :class="statusClass">
      {{ statusText }}123
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  extractColors: {
    type: Boolean,
    default: true, // 默认开启主色提取
  },
});

const emit = defineEmits(["colors-extracted", "color-selected"]); // 定义事件，用于向父组件传递主色数据

// 默认图片
const defaultSrc = "https://i.ibb.co/mrH3PK5b/2.png";

// 主色存储
const mainColors = ref([]);
const statusText = ref("");
const statusClass = ref("");

// ColorThief实例
let colorThief = null;

// 初始化ColorThief
const initColorThief = () => {
  if (process.client) {
    // 动态加载ColorThief库
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/colorthief@2.3.2/dist/color-thief.umd.js";
    script.onload = () => {
      colorThief = new ColorThief(); // 初始化ColorThief实例 ，用于提取图片主色
      statusText.value = "主色提取功能已就绪";
      statusClass.value = "success";
    };
    script.onerror = () => {
      statusText.value = "主色提取功能加载失败";
      statusClass.value = "error";
    };
    document.head.appendChild(script);
  }
};

// 提取图片主色
const extractMainColors = async (imageSrc) => {
  if (!colorThief || !props.extractColors) return;

  statusText.value = "正在提取主色...";
  statusClass.value = "info";

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        // 提取3种主色
        const palette = colorThief.getPalette(img, 3);
        mainColors.value = palette;
        // 动态设置自定义属性，用于背景渐变
        document.documentElement.style.setProperty(
          "--mainColors-0",
          palette[0].join(",")
        );
        document.documentElement.style.setProperty(
          "--mainColors-1",
          palette[1].join(",")
        );
        document.documentElement.style.setProperty(
          "--mainColors-2",
          palette[2].join(",")
        );
        statusText.value = `成功提取${palette.length}种主色`;
        statusClass.value = "success";
        emit("colors-extracted", palette);
      } catch (err) {
        statusText.value = "主色提取失败";
        statusClass.value = "error";
        mainColors.value = [];
      }
    };

    img.onerror = () => {
      statusText.value = "图片加载失败";
      statusClass.value = "error";
      mainColors.value = [];
    };

    img.src = imageSrc;
  } catch (err) {
    statusText.value = "提取过程出错";
    statusClass.value = "error";
    mainColors.value = [];
  }
};

// 图片加载完成
const onImageLoad = () => {
  if (props.src) {
    extractMainColors(props.src);
  }
};

// 图片加载失败
const onImageError = () => {
  statusText.value = "图片加载失败";
  statusClass.value = "error";
  mainColors.value = [];
};

// 点击颜色时触发
const emitColor = (color) => {
  emit("color-selected", color);
};

// 监听src变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      extractMainColors(newSrc);
    }
  }
);

onMounted(() => {
  initColorThief();
  if (props.src) {
    extractMainColors(props.src);
  }
});
</script>

<style scoped lang="scss">
/* 利用3种主色构建出一个图片背景色需要渐变 */
.image-container {
  background: linear-gradient(
    90deg,
    rgb(var(--mainColors-0)) 0%,
    rgb(var(--mainColors-1)) 50%,
    rgb(var(--mainColors-2)) 100%
  );
}

:deep(.el-image-viewer__mask) {
  background: linear-gradient(
    0deg,
    rgb(var(--mainColors-0)) 0%,
    rgb(var(--mainColors-1)) 50%,
    rgb(var(--mainColors-2)) 100%
  ) !important;
  opacity: 1;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.color-palette {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.status-text {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.status-text.success {
  background-color: #f0f9ff;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-text.error {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-text.info {
  background-color: #f6f6f6;
  color: #666;
  border: 1px solid #d9d9d9;
}

.image-desc {
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 14px;
}
</style>
