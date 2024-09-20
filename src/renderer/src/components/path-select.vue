<script lang="ts" setup>
import { getDictPaths } from "@renderer/api/dialog";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import Button from "primevue/button";

const path = defineModel("path", {
  type: String,
  default: "",
});

const handleSelectPath = async () => {
  const paths = await getDictPaths(path.value);
  if (paths.length > 0) {
    path.value = paths[0];
  }
};
</script>

<template>
  <div class="flex items-center gap-4">
    <IconField class="flex-1">
      <InputText :model-value="path" class="w-full" :disabled="true" />
    </IconField>
    <Button @click="handleSelectPath"> 选择路径 </Button>
  </div>
</template>

<style scoped lang="scss"></style>
