<template>
  <el-dialog
    :title="isEdit ? '编辑地址' : '添加地址'"
    v-model="visibleDialog"
    width="400px"
    :before-close="handleBeforeClose"
    :close-on-click-modal="false"
  >
    <!-- 关键修复1：添加 ref="formRef" -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="w-full"
      label-width="auto"
      status-icon
    >
      <!-- 关键修复2：每个 form-item 必须添加 prop，且与 rules 和 form 的 key 对应 -->
      <el-form-item label="地址信息" prop="selected">
        <el-cascader
          :size="elementSize"
          :options="regionData"
          v-model="form.selected"
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="详细地址" prop="detailAddress">
        <el-input
          :size="elementSize"
          v-model="form.detailAddress"
          placeholder="请输入详细地址"
        />
      </el-form-item>
      <el-form-item label="收货人姓名" prop="name">
        <el-input
          :size="elementSize"
          v-model="form.name"
          placeholder="请输入姓名"
        />
      </el-form-item>
      <el-form-item label="收货人手机号" prop="phone">
        <el-input
          :size="elementSize"
          v-model="form.phone"
          placeholder="请输入手机号"
          maxlength="11"
          :formatter="
            (value: string) => value?.replace(/\D/g, '').slice(0, 11) || ''
          "
          :parser="
            (value: string) => value?.replace(/\D/g, '').slice(0, 11) || ''
          "
        />
      </el-form-item>
      <el-form-item label="默认地址" prop="is_default">
        <el-switch v-model="form.is_default" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">{{
        isEdit ? "更新" : "添加"
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus"; // 确保引入 ElMessage
import { regionData, codeToText } from "element-china-area-data";
import { createAddressApi, updateAddressApi } from "~/api/addressApi";
import type { UserAddress } from "~~/server/types/user-address";

const emit = defineEmits(["refresh"]);
const elementSize = "large";
const formRef = ref(); // 关键：表单引用，用于手动触发校验
const submitting = ref(false);

// 响应式数据
const form = ref({
  id: 0,
  selected: [] as string[],
  detailAddress: "",
  name: "",
  phone: "",
  is_default: false,
});
const visibleDialog = ref(false);

// 校验规则（已优化，去除冗余）
const rules = {
  selected: [{ required: true, message: "请选择省市区", trigger: "change" }],
  detailAddress: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
    { min: 5, max: 100, message: "长度5-100个字符", trigger: "blur" },
  ],
  name: [
    { required: true, message: "请输入收货人姓名", trigger: "blur" },
    { min: 2, max: 20, message: "长度2-20个字符", trigger: "blur" },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z·\s]+$/,
      message: "只能包含中文、英文和间隔号",
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "手机号格式不正确",
      trigger: "blur",
    },
  ],
};
const isEdit = ref(false);
// 打开弹窗
function handleOpen(row: UserAddress, flag: boolean = false) {
  isEdit.value = flag;
  visibleDialog.value = true;
  // 重置表单（如果有之前的校验状态）
  nextTick(() => {
    formRef.value.resetFields();
    if (isEdit) {
      form.value = {
        id: Number(row.id),
        selected: [row.province_code, row.city_code, row.district_code],
        detailAddress: row.detail_address || "",
        name: row.recipient_name || "",
        phone: row.recipient_phone || "",
        is_default: row.is_default || false,
      };
    }
  });
}

// 关键修复3：添加前手动触发表单校验
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    // 手动触发全量校验
    await formRef.value.validate((valid: boolean, fields: any) => {
      if (valid) {
        console.log("校验通过，提交数据:", form.value);
        // 这里执行 API 提交
        submitData();
      } else {
        formRef.value.scrollToField(Object.keys(fields)[0]);
      }
    });
  } catch (error) {
    console.error("校验异常:", error);
  }
}

// 提交数据
async function submitData() {
  submitting.value = true;
  const params = {
    id: Number(form.value.id),
    province_code: form.value.selected[0] || "",
    city_code: form.value.selected[1] || "",
    district_code: form.value.selected[2] || "",
    detail_address: form.value.detailAddress || "",
    recipient_name: form.value.name || "",
    recipient_phone: form.value.phone || "",
    is_default: form.value.is_default || false,
  };
  try {
    if (isEdit.value) {
      // 编辑地址
      const res = await updateAddressApi(params);
    } else {
      // 添加地址
      const res = await createAddressApi(params);
    }

    ElMessage.success("地址添加成功");
    visibleDialog.value = false;
    // 触发刷新事件，通知父组件刷新数据
    emit("refresh");
    // 重置表单
    formRef.value?.resetFields();
  } finally {
    submitting.value = false;
  }
}

function handleBeforeClose(done: () => void) {
  // 如果表单为空，直接关闭
  const isEmpty =
    !form.value.selected?.length &&
    !form.value.detailAddress &&
    !form.value.name &&
    !form.value.phone;

  if (isEmpty) {
    done();
    return;
  }

  // 有数据时询问是否关闭
  visibleDialog.value = false;
  ElMessageBox.confirm("是否确定关闭？已填写的内容将丢失", "提示", {
    confirmButtonText: "确定关闭",
    cancelButtonText: "继续填写",
    type: "warning",
    showClose: false,
    closeOnClickModal: false,
  })
    .then(() => {
      // 确认关闭：重置表单并关闭
      formRef.value?.resetFields();
      done(); // 允许关闭
    })
    .catch(() => {
      // 取消关闭：什么都不做，弹窗保持打开
      visibleDialog.value = true;
    });
}

function handleClose() {
  // 手动触发关闭流程，让 before-close 拦截
  visibleDialog.value = false;
}

// 级联选择变化
const onChange = (value: string[]) => {
  console.log("省市区编码:", value, regionData);
  // 级联选择器自动触发 change 校验，无需手动处理
};

// 暴露方法
defineExpose({
  handleOpen,
  handleClose,
});
</script>
