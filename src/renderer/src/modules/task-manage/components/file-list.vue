<script lang="ts" setup>
import { PropType, computed } from "vue";
import { TorrentFile } from "@shared/type";
import { formatBytes } from "@renderer/core/utils/format";

import ProgressBar from "primevue/progressbar";

const props = defineProps({
  list: {
    type: Array as PropType<TorrentFile[]>,
    default: () => [],
  },
  path: {
    type: String,
    default: "",
  },
});

const getFileTypeIcon = (file: TorrentFile) => {
  const videoExtensions =
    // eslint-disable-next-line max-len
    /\.(mp4|mkv|avi|mov|wmv|flv|webm|vob|ogv|ogg|drc|gif|gifv|mng|mts|m2ts|ts|m4v|3gp|3g2|mxf|roq|nsv)$/i; // 扩展正则表达式匹配更多视频文件扩展名
  if (videoExtensions.test(file.name)) {
    return "pi pi-video";
  }
  return "pi pi-file";
};

const formattedFileList = computed(() => {
  return props.list.map((file) => {
    const icon = getFileTypeIcon(file);
    const isVideo = icon === "pi pi-video";
    return {
      ...file,
      length: formatBytes(file.length),
      progress: (file.progress * 100).toFixed(0),
      downloaded: formatBytes(file.downloaded),
      icon,
      isVideo,
    };
  });
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="(file, index) in formattedFileList" :key="index" class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <i :class="`${file.icon}`" />
          <span class="flex-1 text-wrap text-primary-600">{{ file.name }}</span>
        </div>
        <div class="flex gap-2">
          <i v-if="file.isVideo" class="pi pi-play-circle cursor-pointer" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <ProgressBar :value="file.progress" />
        <div class="flex justify-between">
          <span>路径：{{ `${path}` }}</span>
          <span>{{ file.downloaded }} / {{ file.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
