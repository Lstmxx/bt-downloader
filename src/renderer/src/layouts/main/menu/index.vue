<script lang="tsx" setup>
import { useRouter } from "vue-router";
import { useMenu } from "./use-menu";
import TaskCreate from "@renderer/components/task-create/index.vue";

const { menuList, currentMenu } = useMenu();

const router = useRouter();
const handleRouter = (name: string) => {
  router.push({ name });
};
</script>

<template>
  <div class="flex flex-col h-full py-4 bg-primary-900 w-10 items-center">
    <TaskCreate
      class="w-full justify-center flex items-center gap-1 cursor-pointer hover:bg-primary-500 p-2 rounded transition-all text-white"
    />
    <div
      v-for="(menu, index) in menuList"
      :key="index"
      :class="`
      w-full justify-center
      flex items-center gap-1 cursor-pointer
      hover:bg-primary-500 p-2 rounded transition-all
      ${menu.routeName === currentMenu ? 'text-white' : 'text-gray-400'}
      `"
      @click="handleRouter(menu.routeName)"
    >
      <i :class="`pi ${menu.svg}`" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
