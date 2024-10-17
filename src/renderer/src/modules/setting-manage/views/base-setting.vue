<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import DownloaderSetting from "../components/downloader-setting.vue";
import { SETTING_VIEW_LIST, SETTING_VIEW } from "../constant";
import { SettingConfig } from "@shared/type";
import { getConfig } from "@renderer/api/setting";

const currentSettingView = ref(SETTING_VIEW.DOWNLOADER_SETTING);
const config = ref<SettingConfig>({
  downloadPath: "",
  clientOptions: {},
});

const handleGetConfig = async () => {
  config.value = await getConfig();
  console.log("handleGetConfig", config.value);
};

onMounted(() => {
  handleGetConfig();
});
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
    <div class="tw-flex-1">
      <DownloaderSetting v-model="config.clientOptions" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
