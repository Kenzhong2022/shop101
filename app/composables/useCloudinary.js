// composables/useCloudinary.js
import { ref } from "vue";

const CLOUD_NAME = "dlji1nmdj";
const UPLOAD_PRESET = "shop101-upload-preset";

/**
 * 上传图片到 Cloudinary
 *
 * 该函数提供了文件选择、本地预览、上传状态和结果的管理。
 * 可以选择是否在文件选择后立即上传。
 *
 * @param {File} rawFile - 要上传的文件对象
 * @returns {Object} 包含文件选择、预览、上传状态和结果的对象
 */
export function useCloudinary(immediateUpload = false) {
  const file = ref(null); // 原始 File 对象
  const previewUrl = ref(""); // 本地预览地址
  const resultUrl = ref(""); // 上传后的 https://...webp
  const uploading = ref(false);

  /**
   * 选择文件
   * @param {*} rawFile 要选择的文件对象
   * @returns {string} 本地预览地址
   */
  function selectFile(rawFile) {
    if (!rawFile) return;
    file.value = rawFile;
    previewUrl.value = URL.createObjectURL(rawFile);
    resultUrl.value = ""; // 重置旧结果
    if (immediateUpload) {
      upload();
    }
    return previewUrl.value;
  }

  /**
   * 上传文件到 Cloudinary
   * @async
   * @function upload
   * @returns {Promise<string>} 上传后的 https://...webp 地址
   */
  async function upload() {
    if (!file.value) throw new Error("请先选择图片");

    uploading.value = true;
    const nameNoExt = file.value.name.replace(/\.[^.]+$/, "");
    const fd = new FormData();
    fd.append("file", file.value);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("public_id", nameNoExt);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      resultUrl.value = data.secure_url; // 已经是 webp
      ElMessage.success("上传成功");
      return data.secure_url; // 也可以直接返回给调用方
    } finally {
      uploading.value = false;
    }
  }

  /* 清理函数，组件卸载时记得调用 */
  function reset() {
    /**
     * 重置上传状态和结果
     *
     * 该函数会清除当前选择的文件、本地预览地址和上传后的结果。
     */
    if (previewUrl.value.startsWith("blob:"))
      //调用 URL.revokeObjectURL 释放本地预览地址
      URL.revokeObjectURL(previewUrl.value); // 释放本地预览地址
    file.value = null; // 清除原始 File 对象
    previewUrl.value = ""; // 清除本地预览地址
    resultUrl.value = ""; // 清除上传后的结果
  }

  return {
    file, // 原始 File 对象
    previewUrl, // 本地预览地址
    resultUrl, // 上传后的 https://...webp
    uploading, // 是否正在上传
    selectFile, // 选择文件函数
    upload, // 上传函数
    reset, // 重置函数
  };
}
