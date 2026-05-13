<!-- 我的设置 -->
<template>
  <div>我的设置</div>
  <el-form
    ref="formRef"
    :model="userForm"
    label-position="top"
    class="space-y-6"
  >
    <!-- 用户名 -->
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="userForm.username"
        :disabled="!isEditing"
        placeholder="请输入用户名"
        :prefix-icon="User"
      />
    </el-form-item>

    <!-- 邮箱 -->
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="userForm.email"
        :disabled="!isEditing"
        type="email"
        placeholder="请输入邮箱地址"
        :prefix-icon="Message"
      />
    </el-form-item>

    <!-- 昵称 -->
    <el-form-item label="昵称" prop="nickname">
      <el-input
        v-model="userForm.nickname"
        :disabled="!isEditing"
        placeholder="请输入昵称"
        :prefix-icon="UserFilled"
      />
    </el-form-item>

    <!-- 手机号 -->
    <el-form-item label="手机号" prop="phone">
      <el-input
        v-model="userForm.phone"
        :disabled="!isEditing"
        placeholder="请输入手机号"
        :prefix-icon="Phone"
      />
    </el-form-item>
    <!-- 操作按钮 -->
    <el-form-item class="flex justify-center gap-4 pt-4">
      <template v-if="!isEditing">
        <el-button type="primary">编辑信息</el-button>
      </template>
      <template v-else>
        <el-button type="primary">保存修改</el-button>
        <el-button>取消</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});

import { User, UserFilled, Message, Phone } from "@element-plus/icons-vue";

const userState = useUser();
const isEditing = ref(false);

// 原始用户数据（用于取消编辑时恢复）
const originalUser = ref<{
  username: string;
  email: string;
  nickname: string;
  phone: string;
  bio: string;
}>({
  username: "",
  email: "",
  nickname: "",
  phone: "",
  bio: "",
});

// 用户表单数据
const userForm = reactive({
  username: "",
  email: "",
  nickname: "",
  phone: "",
  bio: "",
});

// 初始化用户信息
const initUserInfo = () => {
  const user = userState.value.user;
  if (user) {
    userForm.username = user.username;
    userForm.email = user.email;
    userForm.nickname = "";
    userForm.phone = "";
    userForm.bio = "";

    // 保存原始数据
    originalUser.value = { ...userForm };
  }
};

// 组件挂载时初始化
onMounted(() => {
  initUserInfo();
});

onActivated(() => {
  initUserInfo();
});
</script>
