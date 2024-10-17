<script lang="ts" setup>
import { computed, ref } from "vue";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import { getTorrentFilesByUrl, getTorrentFilesByFile } from "@renderer/api/task";

import { TorrentFile } from "@shared/type";

const emit = defineEmits<{
  (e: "success", result: { files: TorrentFile[]; magnetURI: string }): void;
}>();

const url = ref("");
const loading = defineModel("loading", {
  type: Boolean,
  default: false,
});

const isValidUrl = computed(() => {
  const reg = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(?:&.*)?/i;
  return reg.test(url.value);
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const result = await getTorrentFilesByUrl(url.value);
    if (!result) return;
    const { files, magnetURI } = result;
    console.log("render", files);
    emit("success", { files, magnetURI });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleGetByFile = async () => {
  loading.value = true;
  try {
    const { files, magnetURI } = await getTorrentFilesByFile();
    url.value = magnetURI;
    emit("success", { files, magnetURI });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center gap-4">
    <IconField class="flex-1">
      <InputText
        v-model="url"
        class="w-full"
        :disabled="loading"
        :invalid="url ? !isValidUrl : false"
        placeholder="请输入磁力链接"
      />
      <InputIcon v-if="loading" class="pi pi-spin pi-spinner" />
    </IconField>
    <Button :disabled="!isValidUrl || loading" @click="handleSubmit"> 获取种子 </Button>
    <Button :disabled="loading" @click="handleGetByFile"> 选择种子文件 </Button>
  </div>
</template>

<style scoped lang="scss"></style>
