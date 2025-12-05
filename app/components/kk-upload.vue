<script setup>
import { CloudinaryImage } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { blur } from "@cloudinary/url-gen/actions/effect";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { faces } from "@cloudinary/url-gen/qualifiers/region";

const tempUrl = ref("");
const loading = ref(false);

// 调试：监听 tempUrl 变化
watch(tempUrl, (newVal) => {
  console.log("tempURL changed:", newVal);
});

/* 1. 点击按钮：第一次加载脚本，第二次直接打开 */
async function openUpload() {
  if (!window.cloudinary) {
    loading.value = true;
    await loadCloudinaryScript();
    loading.value = false;
  }
  /* 2. 脚本就位后再建组件（保证 cloudinary 已存在） */
  createAndOpen();
}

/* 3. 动态加载脚本，返回 Promise */
function loadCloudinaryScript() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://upload-widget.cloudinary.com/global/all.js";
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* 4. 真正创建并弹窗 */
function createAndOpen() {
  window.cloudinary
    .openUploadWidget(
      {
        cloudName: "dlji1nmdj",
        uploadPreset: "shop101-upload-preset",
        // 上传前验证文件
        preBatch: (cb, data) => {
          console.log("上传内容", data);
          console.log("上传回调callback函数", cb);
          cb();
        },
      },
      // 上传成功回调
      (err, res) => {
        if (!err && res && res.event === "success") {
          tempUrl.value = res.info.secure_url;
          console.log("上传成功:", res.info.secure_url);
          console.log(
            "处理url",
            new CloudinaryImage(res.info.secure_url).effect(
              blur().strength(100)
            )
          );
        }
      }
    )
    .open(); // 立即弹出
}
</script>

<template>
  <div style="padding: 2rem">
    <h1>Nuxt3 动态加载 Cloudinary</h1>
    <button :disabled="loading" @click="openUpload">
      {{ loading ? "加载中…" : "上传图片" }}
    </button>

    <div v-if="tempUrl">
      <p>
        地址：<a :href="tempUrl" target="_blank">{{ tempUrl }}</a>
      </p>
      <CldImage
        :src="tempUrl"
        width="200"
        height="200"
        alt="My Awesome Image"
        :quality="50"
        gravity="face"
        crop="thumb"
      />
      <h1>二次封装 cld-image 组件</h1>
    </div>
    <div v-else>
      <p style="color: red">等待上传图片...</p>
    </div>
  </div>
</template>
