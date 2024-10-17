<script lang="tsx" setup>
import { ref, toRaw } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import DownloaderSetting from "../components/downloader-setting.vue";
import { SETTING_VIEW_LIST, SETTING_VIEW } from "../constant";
import { setConfig } from "@renderer/api/setting";
import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import { useSettingStore } from "@renderer/store/setting";

const currentSettingView = ref(SETTING_VIEW.DOWNLOADER_SETTING);

const configStore = useSettingStore();

const toast = useToast();

const loading = ref(false);
const handleSetConfig = async () => {
  console.log("handleSetConfig", configStore.config);
  loading.value = true;

  try {
    await setConfig(toRaw(configStore.config));
  } catch (error) {
    console.log(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "保存失败",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col w-full h-full py-4 px-4">
    <Tabs v-model:value="currentSettingView">
      <TabList>
        <Tab v-for="settingView in SETTING_VIEW_LIST" :key="settingView.value" :value="settingView.value">
          {{ settingView.label }}
        </Tab>
      </TabList>
    </Tabs>
    <div class="flex-1 flex justify-center flex-col p-24 items-center">
      <DownloaderSetting v-model="configStore.config.clientOptions" class="flex-1" />
      <div class="w-full flex justify-center items-center">
        <Button type="button" label="保存" :loading="loading" @click="handleSetConfig" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
