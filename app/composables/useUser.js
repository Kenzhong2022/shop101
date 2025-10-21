// 保存和用户相关的信息
import { ref } from "vue";

export const useUser = ref({
  token: "",
  expireTime: 0,
});
