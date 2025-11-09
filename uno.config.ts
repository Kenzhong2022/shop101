import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  shortcuts: [
    // ...
  ],
  theme: {
    colors: {
      veryCool: "#0000ff", // class="text-very-cool"
      brand: {
        primary: "hsl(var(--hue, 217) 78% 51%)", //class="bg-brand-primary"
        DEFAULT: "#ff5500", //class="bg-brand"
      },
      primary: "var(--el-color-primary)",
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
