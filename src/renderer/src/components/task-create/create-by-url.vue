<script lang="ts" setup>
import { computed, ref } from "vue";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import { getTorrentFilesByUrl } from "@renderer/api/task";

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
  const reg = /^magnet:\?xt=urn:btih:[0-9a-fA-F]{40,}.*$/;
  return reg.test(url.value);
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const { files, magnetURI } = await getTorrentFilesByUrl(url.value);
    console.log("render", files);
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
      <InputText v-model="url" class="w-full" :invalid="url ? !isValidUrl : false" placeholder="请输入磁力链接" />
      <InputIcon v-if="loading" class="pi pi-spin pi-spinner" />
    </IconField>
    <Button :disabled="!isValidUrl || loading" @click="handleSubmit"> 获取种子 </Button>
  </div>
</template>

<style scoped lang="scss"></style>
