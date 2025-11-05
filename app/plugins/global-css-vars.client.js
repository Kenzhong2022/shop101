import tinycolor from "tinycolor2"; // 需安装：npm i tinycolor2

function setThemeColor(baseColor) {
  const base = tinycolor(baseColor);
  const hsl = base.toHsl(); // { h: 色相, s: 饱和度(0-1), l: 亮度(0-1) }

  if (process.client) {
    // 基础色
    document.documentElement.style.setProperty(
      "--el-color-primary",
      base.toHexString()
    );
    // 边框颜色
    document.documentElement.style.setProperty(
      "--el-border-color",
      base.toHexString()
    );

    // 生成 light-n 变量（n=3,5,7,8,9）
    [3, 5, 7, 8, 9].forEach((n) => {
      const lightness = Math.min(hsl.l + n * 0.05, 1); // 亮度不超过100%
      // console.log(lightness);
      const lightColor = tinycolor({ ...hsl, l: lightness });

      document.documentElement.style.setProperty(
        `--el-color-primary-light-${n}`,
        lightColor.toRgbString()
      );
    });
  }
}

// 调用示例：设置基础色为红色，自动生成浅色变体
setThemeColor("#ff00ff");
export default defineNuxtPlugin(() => {
  setThemeColor("#ff00ff");
});

// 导出函数，用于在其他地方调用
export { setThemeColor };
