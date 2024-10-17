<script lang="ts" setup>
import { SettingConfig } from "@shared/type";
import { defineModel, PropType } from "vue";

import InputNumber from "primevue/inputnumber";

const options = defineModel({
  type: Object as PropType<SettingConfig["clientOptions"]>,
  required: true,
});

console.log(options);
</script>

<template>
  <div class="mt-4 w-[80%]">
    <form class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <label for="downloadLimit" class="font-bold block mb-2 text-nowrap"> 下载速度 </label>
        <InputNumber v-model="options.downloadLimit" :min="-1" input-id="downloadLimit" suffix="bytes" fluid />
      </div>
      <div class="flex items-center gap-2">
        <label for="uploadLimit" class="font-bold block mb-2 text-nowrap"> 上传速度 </label>
        <InputNumber v-model="options.uploadLimit" :min="-1" input-id="uploadLimit" suffix="bytes" fluid />
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss"></style>
