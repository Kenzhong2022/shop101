// fixCloudinaryTypes.js（ESM 版本，修复路径问题）
import fs from "fs";
import path from "path";

// 1. 正确解析当前脚本所在目录（替代 __dirname，兼容 Windows）
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// 修复 Windows 路径中可能出现的 '/' 转义问题
const normalizedDir = __dirname.startsWith('/') && process.platform === 'win32' 
  ? __dirname.slice(1) 
  : __dirname;

// 2. 定位到 cloudinary 组件目录（基于项目根目录的相对路径）
const compDir = path.resolve(
  normalizedDir, 
  'node_modules/@nuxtjs/cloudinary/dist/runtime/components'
);

// 3. 检查目录是否存在，避免报错
if (!fs.existsSync(compDir)) {
  console.error(`❌ 未找到组件目录：${compDir}`);
  console.error("可能原因：");
  console.error("1. @nuxtjs/cloudinary 未安装，请执行 npm install @nuxtjs/cloudinary");
  console.error("2. 组件目录路径可能因版本不同变化（尝试去掉路径中的 'runtime' 目录）");
  process.exit(1); // 终止脚本
}

// 4. 遍历并修改所有 .vue 文件
fs.readdirSync(compDir).forEach((file) => {
  if (file.endsWith(".vue")) {
    const filePath = path.join(compDir, file);
    let content = fs.readFileSync(filePath, "utf-8");
    // 批量替换接口继承（支持单行和多行格式）
    let modifiedContent = content.replace(
      /(export )?interface (\w+)Props extends (\w+)/g,
      '$1interface $2Props extends /* @vue-ignore */ $3'
    );
    
    // 处理多行接口继承的情况（如 CldUploadWidgetProps）
    modifiedContent = modifiedContent.replace(
      /(export )?interface (\w+)Props\s*\n\s*extends\s+(\w+)/g,
      '$1interface $2Props\n  extends /* @vue-ignore */ $3'
    );

    // 处理 export type 语法（如 CldVideoPlayerProps 和 CldOgImageProps）
    modifiedContent = modifiedContent.replace(
      /export type (\w+)Props = (\w+) & /g,
      'export type $1Props = /* @vue-ignore */ $2 & '
    );
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ 已处理：${file}`);
    } else {
      console.log(`ℹ️ 无需处理：${file}`);
    }
  }
});

console.log("\n🎉 所有 Cloudinary 组件类型修复完成！");
console.log("提示：请执行 npx patch-package @nuxtjs/cloudinary 生成补丁，避免依赖覆盖");