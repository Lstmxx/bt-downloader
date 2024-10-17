import { getConfig } from "@renderer/api/setting";
import { SettingConfig } from "@shared/type";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingStore = defineStore("setting-store", () => {
  const config = ref<SettingConfig>({
    downloadPath: "",
    clientOptions: {},
  });

  const handleGetConfig = async () => {
    const c = await getConfig();
    config.value = c;
  };

  handleGetConfig();

  return {
    config,
  };
});
