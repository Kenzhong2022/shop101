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
      @click="handleUpload"
      class="bg-#4caf50 text-white px-24px py-10px border-none cursor-pointer disabled:bg-#aaa disabled:cursor-not-allowed hover:bg-#45a049 transition-colors"
    >
      {{ uploading ? "上传中…" : "上传图片" }}
    </button>

    <!-- 预览 / 结果 -->
    <div v-if="previewUrl" class="mt-20px">
      <img :src="previewUrl" alt="preview" class="max-w-200px" />
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
import { useCloudinary } from "@/composables/useCloudinary";

const { file, previewUrl, resultUrl, uploading, selectFile, upload } =
  useCloudinary();

// 处理文件选择 - 自动上传
async function onSelect(e) {
  const res = selectFile(e.target.files?.[0]);
  console.log("previewUrl:", res);

  // 文件选择完成后自动上传
  if (file.value) {
    try {
      await upload();
    } catch (err) {
      alert("上传失败：" + err.message);
    }
  } else {
    alert("请选择图片");
  }
}

async function handleUpload() {
  try {
    await upload();
  } catch (err) {
    alert("上传失败：" + err.message);
  }
}
</script>
