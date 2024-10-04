<script lang="ts" setup>
import { PropType, computed } from "vue";
import { TaskInfo } from "@shared/type";
import { formatBytes } from "@renderer/core/utils/format";

import ProgressBar from "primevue/progressbar";
import Divider from "primevue/divider";
import FileList from "../file-list.vue";
import { useHandler } from "./use-handler";
import { TASK_STATUS } from "@shared/enum";

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

const isPaused = computed(() => {
  return props.task.status === TASK_STATUS.PAUSED;
});

const isDone = computed(() => {
  return props.task.status === TASK_STATUS.DONE;
});

const progressValueCls = computed(() => {
  if (isPaused.value) {
    return "!bg-success";
  }

  if (isDone.value) {
    return "!bg-warning";
  }
  return "!bg-blue";
});

const { handleDelete, handlePause, handleResume } = useHandler(props);
</script>

<template>
  <div class="flex flex-col border-primary-300 border border-solid rounded-md gap-2 p-4 text-primary-400">
    <div class="flex justify-between items-center">
      <span class="flex-1 text-wrap font-bold text-primary-600">{{ task.name }}</span>
      <div class="flex gap-2">
        <i v-if="isPaused" class="pi pi-play cursor-pointer" @click="handleResume" />
        <i v-else class="pi pi-pause cursor-pointer" @click="handlePause" />
        <i class="pi pi-times cursor-pointer" @click="handleDelete" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <ProgressBar :value="progress" :pt:value:class="progressValueCls" />
      <div class="flex justify-between items-center gap-4">
        <div v-if="!(isDone || isPaused)" class="flex items-center gap-4">
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
