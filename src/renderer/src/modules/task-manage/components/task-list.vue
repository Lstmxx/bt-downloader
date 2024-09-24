<script lang="ts" setup>
import { PropType } from "vue";
import { TaskInfo } from "@shared/type";

import TaskItem from "./task-item/index.vue";

import ScrollPanel from "primevue/scrollpanel";

defineProps({
  list: {
    type: Array as PropType<TaskInfo[]>,
    default: () => [],
  },
});
</script>

<template>
  <div class="overflow-hidden h-full">
    <ScrollPanel class="h-full">
      <div class="flex flex-col gap-8 mt-8">
        <TaskItem v-for="(task, index) in list" :key="index" :task="task" />
      </div>
    </ScrollPanel>
  </div>
</template>

<style scoped lang="scss"></style>
