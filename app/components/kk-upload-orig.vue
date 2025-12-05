<template>
  <div class="max-w-600px mx-auto my-40px text-center font-[Arial,sans-serif]">
    <h2>Cloudinary 统一 webp 上传</h2>

    <!-- 选图 -->
    <div
      class="border-2 border-dashed border-#ccc p-40px cursor-pointer mb-16px hover:border-#999 transition-colors"
      @click="$refs.fileInput.click()"
    >
      <p>点击选择图片</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onSelect"
      />
    </div>

    <!-- 上传按钮 -->
    <button
      :disabled="!file || uploading"
      @click="doUpload"
      class="bg-#4caf50 text-white px-24px py-10px border-none cursor-pointer disabled:bg-#aaa disabled:cursor-not-allowed hover:bg-#45a049 transition-colors"
    >
      {{ uploading ? "上传中…" : "上传图片" }}
    </button>

    <!-- 预览 / 结果 -->
    <div v-if="src" class="mt-20px">
      <img :src="src" alt="preview" class="max-w-200px" />
      <p v-if="resultUrl" class="break-all">
        上传成功：<br />
        <a
          :href="resultUrl"
          target="_blank"
          class="text-blue-600 hover:text-blue-800 underline"
          >{{ resultUrl }}</a
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const cloudName = "dlji1nmdj"; // 你的 cloud name
const uploadPreset = "shop101-upload-preset"; // 已配好 use_filename + format=webp

const fileInput = ref(null);
const file = ref(null);
const src = ref(""); // 本地预览地址
const resultUrl = ref(""); // 上传后返回的 url
const uploading = ref(false);

/* 选择文件 */
function onSelect(e) {
  const raw = e.target.files?.[0];
  if (!raw) return;
  file.value = raw;
  src.value = URL.createObjectURL(raw);
  resultUrl.value = ""; // 重置旧结果
}

/* 上传 */
async function doUpload() {
  if (!file.value) return;
  uploading.value = true;

  // 去掉扩展名做 public_id ：比如 good_1.webp 就会变成 good_1
  const nameNoExt = file.value.name.replace(/\.[^.]+$/, "");
  const fd = new FormData(); // 表单数据对象
  fd.append("file", file.value);
  fd.append("upload_preset", uploadPreset);
  fd.append("public_id", nameNoExt);
  // 1. 逐个字段打印
  for (const [k, v] of fd.entries()) {
    console.log(k, ":", v);
  }

  // 2. 如果你想一眼看全（数组形式）
  console.log("FormData 内容", [...fd.entries()]);
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd }
    );
    const data = await res.json();
    resultUrl.value = data.secure_url; // https://.../good_1.webp
  } catch (e) {
    alert("上传失败：" + e.message);
  } finally {
    uploading.value = false;
  }
}
</script>
