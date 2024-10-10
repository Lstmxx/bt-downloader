<script lang="tsx" setup>
import { ref } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import { SETTING_VIEW_LIST, SETTING_VIEW } from "../constant";

const currentSettingView = ref(SETTING_VIEW.DOWNLOADER_SETTING);
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
  </div>
</template>

<style scoped lang="scss"></style>
