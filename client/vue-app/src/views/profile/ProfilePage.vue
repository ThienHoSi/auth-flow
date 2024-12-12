<script setup lang="ts">
import MainLayout from '@/components/UI/layout/MainLayout.vue'
import { privateAxiosInstance } from '@/network/axiosInstance'
import { ref } from 'vue'

const user = ref<{
  id: null | number
  email: null | string
  password: null | string
  name: null | string
}>({
  id: null,
  email: null,
  password: null,
  name: null
})

const getUserInfo = async () => {
  try {
    const { data } = await privateAxiosInstance.get('/auth/me')
    if (data) {
      user.value = data
    }
  } catch (err) {
    console.error(err)
  }
}

getUserInfo()
</script>

<template>
  <MainLayout>
    <h1>Welcome {{ user.name }},</h1>
  </MainLayout>
</template>
