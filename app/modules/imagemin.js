// modules/imagemin.js
import viteImagemin from 'vite-plugin-imagemin'

export default function () {
  return {
    name: 'vite-imagemin',
    config (config, { isDev }) {
      // 仅生产环境生效
      if (!isDev) {
        config.plugins.push(
          viteImagemin({
            gifsicle: { optimizationLevel: 3 },
            mozjpeg:  { quality: 80 },
            pngquant: { quality: [0.8, 0.9] },
            svgo:     { plugins: [{ name: 'removeViewBox', active: false }] },
            webp:     { quality: 75 }
          })
        )
      }
    }
  }
}