<template>
  <q-page class="flex column items-center justify-start">
    <img
      alt="logo"
      src="~assets/logo.png"
    >
  </q-page>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  onMounted(() => {
    setTimeout(() => {
      router.push('/langs')
    }, 100) // 5000 ms = 5 secondes
  })
</script>
