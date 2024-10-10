<script lang="ts" setup>
import { SettingConfig } from "@shared/type";
import { defineModel, PropType } from "vue";

const options = defineModel({
  type: Object as PropType<SettingConfig["clientOptions"]>,
  required: true,
});

console.log(options);
</script>

<template>
  <div></div>
</template>

<style scoped lang="scss"></style>
