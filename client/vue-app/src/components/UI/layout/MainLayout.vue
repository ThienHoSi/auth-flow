<template>
  <div>
    <div class="flex items-center justify-between">
      <nav>
        <ul class="flex gap-x-3">
          <RouterLink to="/" class="p-3 hover:underline cursor-pointer text-blue-400">Home</RouterLink>
          <RouterLink to="/dashboard" class="p-3 hover:underline cursor-pointer text-blue-400">Dashboard</RouterLink>
          <RouterLink to="/profile" class="p-3 hover:underline cursor-pointer text-blue-400">Profile</RouterLink>
        </ul>
      </nav>
      <button @click.prevent="performLogout">Logout</button>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import useAuth from '@/composables/useAuth';

const { performLogout } = useAuth()
</script>
