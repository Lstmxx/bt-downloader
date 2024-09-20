import { useSettingStore } from "@renderer/store/setting";
import { ref, watch } from "vue";

export const useDownloadPath = () => {
  const store = useSettingStore();
  const downloadPath = ref("");

  watch(
    () => store.config.downloadPath,
    () => {
      downloadPath.value = store.config.downloadPath;
    },
    {
      immediate: true,
    },
  );

  return {
    downloadPath,
  };
};
