<script lang="ts" setup>
import { ref } from "vue";

import Dialog from "primevue/dialog";
import Create from "./create.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import PathSelect from "../path-select.vue";

import { TorrentFile } from "@shared/type";
import { formatBytes } from "@renderer/core/utils/format";
import { useDownloadPath } from "./use-download-path";
import { startDownload } from "@renderer/api/task";

type FileItem = TorrentFile & {
  formatSize: string;
};

let currentMagnetURI = "";

const loading = ref(false);
const visible = ref(false);

const files = ref<FileItem[]>([]);

const selectedFiles = ref<FileItem[]>([]);

const DataTableRef = ref<InstanceType<typeof DataTable> | null>(null);

const handleOpenDialog = () => {
  visible.value = true;
};

const handleGetFilesSuccess = (result: { files: TorrentFile[]; magnetURI: string }) => {
  currentMagnetURI = result.magnetURI;
  files.value = result.files.map((file) => {
    return {
      ...file,
      formatSize: formatBytes(file.length),
    };
  });

  selectedFiles.value = files.value;
};

const { downloadPath } = useDownloadPath();

const handleClose = () => {
  visible.value = false;
  selectedFiles.value = [];
  loading.value = false;
  files.value = [];
};

const handleStartDownload = async () => {
  console.log("start download", selectedFiles.value, downloadPath.value, currentMagnetURI);
  await startDownload([{ magnetURI: currentMagnetURI, selectFiles: selectedFiles.value.map((file) => file.path) }], {
    downloadPath: downloadPath.value,
  });
  visible.value = false;
};
</script>

<template>
  <div class="flex items-center justify-center cursor-pointer">
    <i class="pi pi-plus" @click="handleOpenDialog" />
    <Dialog v-model:visible="visible" modal header="新增种子任务" :style="{ width: '50rem' }" :closable="false">
      <div class="flex flex-col gap-4">
        <Create v-model:loading="loading" @success="handleGetFilesSuccess" />
        <DataTable
          ref="DataTableRef"
          v-model:selection="selectedFiles"
          :value="files"
          table-style="min-width: 50rem;min-height: 200px"
          scrollable
          scroll-height="200px"
          :loading="loading"
        >
          <Column selection-mode="multiple" header-style="width: 3rem" />
          <Column field="name" header="文件名" style="min-width: 16rem" />
          <Column style="min-width: 16rem" field="formatSize" header="大小" />
        </DataTable>
        <PathSelect v-model:path="downloadPath" />
        <div class="flex gap-2 justify-end">
          <Button type="button" label="取消" severity="secondary" @click="handleClose" />
          <Button
            type="button"
            label="确定"
            :disabled="selectedFiles.length === 0 || loading"
            @click="handleStartDownload"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped lang="scss"></style>
