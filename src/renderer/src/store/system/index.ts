import { defineStore } from "pinia";
import { ref } from "vue";

export const useSystemStore = defineStore("system-store", () => {
  const isReady = ref(false);
  const handleReady = () => {
    isReady.value = true;
  };
  window.api.onTorrentDone(handleReady);
  return {
    isReady,
  };
});
