<script lang="tsx" setup>
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import { TASK_STATUS_LIST } from "../constant";

import TaskList from "../components/task-list.vue";

import { useList } from "../hooks/use-list";

const { currentStatus, taskInfos } = useList();
</script>

<template>
  <div class="flex flex-col w-full h-full py-4 px-4">
    <Tabs v-model:value="currentStatus" :scrollable="true">
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
