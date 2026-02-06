// composables/useScroll.js
import { ref, onMounted, onUnmounted } from "vue";

export function useScroll() {
  const scrollY = ref(0);
  const scrollX = ref(0);

  const handleScroll = () => {
    scrollY.value = window.scrollY;
    scrollX.value = window.scrollX;
  };

  onMounted(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 初始化
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return { scrollY, scrollX };
}
