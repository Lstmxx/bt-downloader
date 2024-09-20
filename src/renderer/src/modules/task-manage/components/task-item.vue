<script lang="ts" setup>
import { PropType, computed } from "vue";
import { TaskInfo } from "@shared/type";
import { formatBytes } from "@renderer/core/utils/format";

import ProgressBar from "primevue/progressbar";
import Divider from "primevue/divider";
import FileList from "./file-list.vue";

const props = defineProps({
  task: {
    type: Object as PropType<TaskInfo>,
    required: true,
  },
});

const downloadedAndTotal = computed(() => {
  return `${formatBytes(props.task.downloaded)} / ${formatBytes(props.task.length)}`;
});

const downloadSpeed = computed(() => {
  return `${formatBytes(props.task.downloadSpeed)}/s`;
});

const uploadSpeed = computed(() => {
  return `${formatBytes(props.task.uploadSpeed)}/s`;
});

const progress = computed(() => {
  return (props.task.progress * 100).toFixed(0);
});

const progressValueCls = computed(() => {
  if (props.task.done) {
    return "!bg-success";
  }

  if (props.task.paused) {
    return "!bg-warning";
  }
  return "!bg-blue";
});
</script>

<template>
  <div class="flex flex-col border-primary-300 border border-solid rounded-md gap-2 p-4 text-primary-400">
    <div class="flex justify-between items-center">
      <span class="flex-1 text-wrap font-bold text-primary-600">{{ task.name }}</span>
      <div class="flex gap-2">
        <i v-if="task.paused" class="pi pi-play cursor-pointer" />
        <i v-else class="pi pi-pause cursor-pointer" />
        <i class="pi pi-times cursor-pointer" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <ProgressBar :value="progress" :pt:value:class="progressValueCls" />
      <div class="flex justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="text-success flex items-center gap-2">
            <i class="pi pi-arrow-down" />
            <span>
              {{ downloadSpeed }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <i class="pi pi-arrow-up" />
            <span>
              {{ uploadSpeed }}
            </span>
          </div>
        </div>
        <span>{{ downloadedAndTotal }}</span>
      </div>
    </div>
    <Divider />
    <FileList :list="task.files" />
  </div>
</template>

<style scoped lang="scss"></style>
