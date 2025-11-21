<template>
  <CldUploadWidget
    v-slot="{ open }"
    uploadPreset="shop101-upload-preset"
    :onSuccess="handleUploadSuccess"
  >
    <button type="button" @click="open">Upload an Image</button>
  </CldUploadWidget>
</template>

<script setup>
function handleUploadSuccess({ info }) {
  console.log("上传完成", info.secure_url);
  alert("上传完成，图片地址为：" + info.secure_url);
}
</script>
