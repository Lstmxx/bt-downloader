<script lang="ts" setup>
import Menu from './menu/index.vue';

</script>

<template>
  <div class=" h-svh w-svw flex overflow-hidden">
    <Menu />
    <div class="flex-1">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
