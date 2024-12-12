<script setup lang="ts">
import Button from 'primevue/button'

interface BaseButtonProps {
  label?: string
  disabled?: boolean
  class?: string
  buttonType?: 'liner' | 'neutral' | 'cancel' | 'default'
  buttonSize?: 'small' | 'default'
}
const props = defineProps<BaseButtonProps>()
const { buttonType, buttonSize, ...rest } = props
</script>

<template>
  <Button
    v-bind="rest"
    :label="props.label"
    class="bg-white border border-gray-1 rounded-md min-w-64 px-[10px] py-4 h-[50px] flex justify-center items-center"
    :class="buttonSize === 'small' ? 'min-w-48' : ''"
    :pt="{
      root: `button--${buttonType} ${props.class}`
    }"
    :disabled="props.disabled"
  >
    <template #icon>
      <slot></slot>
    </template>
  </Button>
</template>
