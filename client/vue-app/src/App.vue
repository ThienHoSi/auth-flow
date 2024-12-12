<script setup lang="ts">
import { RouterView } from 'vue-router'
import useCheckingIfLoggedIn from './composables/useCheckingIfLoggedIn';

useCheckingIfLoggedIn()
</script>

<template>
  <div class="p-6 transform">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
