<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <label>
    {{ label }}
    <input v-bind="$attrs" />
  </label>
</template>
