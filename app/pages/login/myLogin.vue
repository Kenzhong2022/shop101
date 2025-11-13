/** * 登录/注册页面 - Element Plus 重构版 * * 功能特点： * - 使用 Element Plus
组件库 * - 支持登录和注册模式切换 * - 表单验证 * - 响应式设计 * - 社交媒体登录 *
- 记住密码功能 */

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-startstart justify-center p-4"
  >
    <div class="w-full max-w-md flex flex-col gap-20px">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4"
        >
          <el-icon class="text-2xl text-white"><User /></el-icon>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          {{ isLoginMode ? "欢迎回来" : "创建账户" }}
        </h1>
        <p class="text-gray-600">
          {{ isLoginMode ? "请登录您的账户" : "注册新账户开始购物" }}
        </p>
      </div>

      <!-- 登录/注册表单 -->
      <el-card class="shadow-lg">
        <!-- 模式切换标签 -->
        <el-tabs
          v-model="activeTab"
          class="mb-6"
          @tab-change="onTabChange(activeTab)"
        >
          <el-tab-pane label="登录" name="login" />
          <el-tab-pane label="注册" name="register" />
        </el-tabs>

        <!-- Element Plus 表单 -->
        <el-form
          ref="loginFormRef"
          :model="form"
          :rules="formRules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <!-- 邮箱输入 -->
          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱地址"
              :prefix-icon="Message"
              size="small"
            />
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="small"
            >
              <template #suffix>
                <el-button
                  link
                  type="primary"
                  @click="showPassword = !showPassword"
                  class="p-0"
                >
                  <el-icon>
                    <View v-if="!showPassword" />
                    <Hide v-if="showPassword" />
                  </el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <!-- 注册模式下的额外字段 -->
          <template v-if="!isLoginMode">
            <!-- 确认密码 -->
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                :prefix-icon="Lock"
                size="small"
              />
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item label="验证码" prop="code">
              <el-input
                v-model="form.code"
                type="text"
                placeholder="请输入验证码"
                :prefix-icon="Promotion"
                size="small"
              >
                <template #suffix>
                  <el-button
                    link
                    type="primary"
                    @click="handleSendCode"
                    class="p-0"
                  >
                    获取验证码
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 用户名 -->
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="small"
              />
            </el-form-item>
          </template>

          <!-- 登录模式下的额外选项 -->
          <div
            v-if="isLoginMode"
            class="flex items-center justify-between mb-4"
          >
            <el-checkbox v-model="form.rememberMe" label="记住我" />
            <el-button link type="primary" @click="handleForgotPassword">
              忘记密码？
            </el-button>
          </div>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              :loading="isLoading"
              :disabled="!isFormValid"
              @click="handleSubmit"
              size="small"
              class="w-full"
            >
              {{ isLoading ? "处理中..." : isLoginMode ? "登录" : "注册" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 分隔线 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">或者</span>
          </div>
        </div>

        <!-- 社交媒体登录 -->
        <div class="" v-if="false">
          <el-button
            @click="handleSocialLogin('wechat')"
            :icon="ChatDotRound"
            size="small"
            class="w-full"
          >
            微信登录
          </el-button>

          <el-button
            @click="handleSocialLogin('qq')"
            :icon="Promotion"
            size="small"
            class="w-full"
          >
            QQ登录
          </el-button>
        </div>

        <!-- 注册模式下的协议 -->
        <div v-if="!isLoginMode" class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            注册即表示您同意我们的
            <el-button
              link
              type="primary"
              size="small"
              @click="showTermsDialog = true"
            >
              服务条款
            </el-button>
            和
            <el-button
              link
              type="primary"
              size="small"
              @click="showPrivacyDialog = true"
            >
              隐私政策
            </el-button>
          </p>
        </div>
      </el-card>

      <!-- 测试提示 -->
      <div class="mt-6 text-center text-xs text-gray-500">
        <p>测试账户: user@shop101.com / Aa123456</p>
        <p class="mt-1">路由守卫已激活 - 查看控制台输出</p>
      </div>

      <!-- 服务条款对话框 -->
      <el-dialog
        v-model="showTermsDialog"
        title="服务条款"
        width="80%"
        :max-width="600"
      >
        <div class="text-sm text-gray-600 space-y-4">
          <p>欢迎使用我们的服务！请仔细阅读以下服务条款：</p>
          <ul class="list-disc list-inside space-y-2">
            <li>用户必须提供真实、准确的个人信息</li>
            <li>用户账户安全由用户自行负责</li>
            <li>禁止发布违法、违规内容</li>
            <li>服务条款可能随时更新</li>
          </ul>
        </div>
        <template #footer>
          <el-button @click="showTermsDialog = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 隐私政策对话框 -->
      <el-dialog
        v-model="showPrivacyDialog"
        title="隐私政策"
        width="80%"
        :max-width="600"
      >
        <div class="text-sm text-gray-600 space-y-4">
          <p>我们重视您的隐私保护，请了解我们的隐私政策：</p>
          <ul class="list-disc list-inside space-y-2">
            <li>我们收集的信息类型和用途</li>
            <li>信息保护措施</li>
            <li>Cookie 的使用</li>
            <li>第三方服务的使用</li>
          </ul>
        </div>
        <template #footer>
          <el-button @click="showPrivacyDialog = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
// 引入登录 注册 API
import { login, register, sendCode } from "~/api/auth";

import { type FormInstance, type FormRules } from "element-plus";
import {
  User,
  Lock,
  Message,
  View,
  Hide,
  ChatDotRound,
  Promotion,
} from "@element-plus/icons-vue";
import { useUser } from "~/composables/useUser";

// 页面元信息
definePageMeta({
  title: "登录/注册",
  pageInfo: {
    requiresAuth: false,
    requiresAdmin: false,
    pageType: "auth",
  },
});

// 表单实例
const loginFormRef = ref<FormInstance>();

// 响应式数据
const isLoginMode = ref<boolean>(true);
const isLoading = ref(false);
const showPassword = ref(false);
const activeTab = ref<"login" | "register">("login");

// 对话框状态
const showTermsDialog = ref(false);
const showPrivacyDialog = ref(false);

// 监听标签切换
const onTabChange = (name: string) => {
  console.log(name);
  isLoginMode.value = name === "login";
  // 清空表单验证状态
  loginFormRef.value?.clearValidate();
};

// 表单数据
const form = reactive({
  email: "user@shop101.com",
  password: "Aa123456",
  confirmPassword: "",
  code: "",
  username: "",
  rememberMe: false,
});

// 表单验证规则
const formRules = computed<FormRules>(() => ({
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少为6位", trigger: "blur" },
  ],
  confirmPassword: !isLoginMode.value
    ? [
        { required: true, message: "请确认密码", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            if (value !== form.password) {
              console.log("两次输入的密码不一致");
              callback(new Error("两次输入的密码不一致")); // 验证失败
            } else {
              console.log("两次输入的密码一致");
              callback(); // 验证通过
            }
          },
          trigger: "blur",
        },
      ]
    : [],
  username: !isLoginMode.value
    ? [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 2, max: 20, message: "用户名长度为2-20个字符", trigger: "blur" },
      ]
    : [],
}));

// 表单验证状态
const isFormValid = computed(() => {
  return (
    form.email &&
    form.password &&
    (isLoginMode.value ||
      (form.confirmPassword &&
        form.username &&
        form.password === form.confirmPassword))
  );
});

// 提交处理
/**
 * @description 登录/注册提交处理
 * @detail 登录模式下，验证邮箱和密码，成功后将token存储到cookie和localStorage，跳转到用户中心。
 * 注册模式下，模拟注册流程，成功后通知用户登录。
 * @returns {Promise<void>}
 */
const handleSubmit = async () => {
  // 表单验证
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
  } catch (error) {
    ElMessage.error("请检查表单输入");
    return;
  }

  isLoading.value = true;
  console.log("打印表单内容:", form);
  try {
    // 调用登录 API 或注册 API
    if (isLoginMode.value) {
      await login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      }).then(async (res) => {
        // 登录失败处理
        if (!res.success) {
          console.log("登录失败后端返回:", res);
          ElMessage.error(res.message || "登录失败");
        } else {
          // 登录成功处理
          console.log("登录成功后端返回token：", res.data?.token);
          // 登录成功，将 token 存储到 localStorage
          if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
          }

          // 现在就可以读/写
          useUser.value.token = res.data?.token || "";
          useUser.value.expireTime = Number(useUser.value.token.split(".")[1]);
          console.log("token:", useUser.value.token);
          console.log("过期时间:", useUser.value.expireTime);
          //存入token到cookie
          useCookie("auth-token").value = res.data?.token || "";

          // 成功通知
          ElNotification({
            title: "成功",
            message: "登录成功！",
            type: "success",
            duration: 3000,
          });

          // 登录成功，跳转到用户中心
          navigateTo("/user/myUser");
        }
      });
    } else {
      // 注册模式
      await register({ ...form }).then((res) => {
        // 注册失败处理
        if (!res.success) {
          console.log("注册失败后端返回:", res);
          ElMessage.error(res.message || "注册失败");
        } else {
          // 注册成功处理
          console.log("注册成功后端返回:", res);
          ElMessage.success("注册成功，请登录");
          activeTab.value = "login";
          isLoginMode.value = true;
          // 清空注册字段
          form.username = "";
          form.confirmPassword = "";
        }
      });
    }
  } catch (error: any) {
    // 登录/注册失败处理
    console.error("❌ 登录/注册失败:", error);
    ElMessage.error(error.data?.statusMessage || "登录/注册失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

// 社交媒体登录
const handleSocialLogin = (provider: string) => {
  ElMessage.info(`${provider}登录功能开发中...`);
  console.log(`🔗 ${provider}登录被点击`);
};

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info("密码重置功能开发中...");
  console.log("🔑 忘记密码被点击");
};

const handleSendCode = async () => {
  // 表单验证
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validateField("email");
  } catch (error) {
    ElMessage.error("请输入正确的邮箱格式");
    return;
  }

  // 调用发送验证码 API
  await sendCode(form.email).then((res) => {
    // 发送验证码失败处理
    if (!res.success) {
      console.log("发送验证码失败后端返回:", res);
      ElMessage.error(res.message || "发送验证码失败");
    } else {
      // 发送验证码成功处理
      console.log("发送验证码成功后端返回:", res);
    }
  });

  ElMessage.success("验证码发送成功");
  console.log("🔑 验证码发送被点击");
};

// 页面加载完成
onMounted(() => {
  console.log("📱 登录/注册页面已加载");
  console.log("🔐 当前模式:", isLoginMode.value ? "登录" : "注册");

  // 欢迎提示
  ElMessage({
    message: "欢迎使用 KKShop 登录系统",
    type: "info",
    duration: 4000,
  });
});
</script>
