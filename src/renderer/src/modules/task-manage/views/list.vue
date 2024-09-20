<script lang="tsx" setup>
import { ref, watch, shallowRef } from "vue";

import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import { TASK_STATUS_LIST, TASK_STATUS } from "../constant";

import TaskList from "../components/task-list.vue";
import { TaskInfo } from "@shared/type";
import { useLoopGetDownloadingTasksInfo } from "../hooks/use-loop-get-tasks-info";

const currentStatus = ref(TASK_STATUS.DOWNLOADING);

const taskInfos = shallowRef<TaskInfo[]>([]);

const { startLoop, stopLoop } = useLoopGetDownloadingTasksInfo({
  handleSuccess(result) {
    console.log("loop", result);
    taskInfos.value = result;
  },
  handleError() {
    console.error("获取任务列表失败");
  },
});

const handleGetTaskList = (status: TASK_STATUS) => {
  console.log(status);
  stopLoop();
  startLoop();
};

watch(
  currentStatus,
  (status) => {
    handleGetTaskList(status);
    console.log(status);
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="flex flex-col w-full h-full py-4 px-4">
    <Tabs v-model="currentStatus" :scrollable="true">
      <TabList>
        <Tab v-for="status in TASK_STATUS_LIST" :key="status.value" :value="status.value">
          {{ status.label }}
        </Tab>
      </TabList>
    </Tabs>
    <TaskList :list="taskInfos" class="flex-1" />
  </div>
</template>

<style scoped lang="scss"></style>
