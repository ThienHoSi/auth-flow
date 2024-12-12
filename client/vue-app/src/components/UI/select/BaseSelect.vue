<script setup lang="ts">
withDefaults(defineProps<{ choices: { text: string; value: string }[] }>(), {
  choices: () => []
})
</script>

<template>
  <select v-bind="$attrs">
    <option disabled />
    <option v-for="(choice, index) in choices" :key="index">{{ choice.text }}</option>
  </select>
</template>
