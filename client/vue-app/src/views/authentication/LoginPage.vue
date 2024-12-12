<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setAuthStorageValues } from '@/helper'
import publicAxiosInstance from '@/network/axiosInstance'

const router = useRouter()

const error = ref('')
const fields = ref({ email: 'nguyenvana@gmail.com', password: '123456' })

const handleLogin = async () => {
  error.value = ''

  try {
    const { data, status } = await publicAxiosInstance.post('/auth/login', {
      email: fields.value.email,
      password: fields.value.password
    })
    if (status === 200 && data) {
      setAuthStorageValues(data.token)
      router.push({
        name: 'DashboardPage'
      })
    }
  } catch (err: any) {
    if (err?.response?.status === 401) {
      return (error.value = 'Email hoặc mật khẩu không chính xác!')
    }
    error.value = 'Lỗi không xác đinh. Liên hệ contact@abc.com để được hỗ trợ.'
  }

  // fetch(`${BASE_API}/auth/login`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   credentials: 'include',
  //   body: JSON.stringify(fields.value)
  // })
  //   .then((res) => {
  //     if (res.ok) return res.json()
  //     throw res
  //   })
  //   .then(({ token }) => {
  //     setAuthStorageValues(token)
  //   })
  //   .catch((err) => {
  //     if (err.status === 401) {
  //       return (error.value = 'Email hoặc mật khẩu không chính xác!')
  //     }
  //     error.value = 'Lỗi không xác đinh. Liên hệ contact@abc.com để được hỗ trợ.'
  //   })
}

const open = ref(false)
</script>

<template>
  <h1>Login</h1>
  <form>
    <label for="email">Email</label><br />
    <input class="outline" type="email" name="email" id="email" :value="fields.email" /><br />
    <label for="password">Password</label><br />
    <input
      class="outline"
      type="password"
      name="password"
      id="password"
      :value="fields.password"
    /><br />
    <br />
    <button class="border border-black rounded p-2" type="submit" @click.prevent="handleLogin">
      Login
    </button>
  </form>

  <button @click="open = true">Open Modal</button>
  <div v-if="open" class="border fixed z-50 top-1/4 left-1/2 w-[300px] ml-[-150px]">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>
  <p v-if="error" class="text-red-500">{{ error }}</p>
</template>
